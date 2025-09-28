/**
 * All market actions are done over the marketplace
 *
 * Created by kc on 20.04.15.
 */

const gameCache          = require('../gameCache');
const propWrap           = require('../propertyWrapper');
const teamAccount        = require('./teamAccount');
const propertyAccount    = require('./propertyAccount');
const chancelleryAccount = require('./chancelleryAccount');
const propertyActions    = require('../../../components/checkin-datastore/lib/properties/actions');
const logger             = require('../../../common/lib/logger').getLogger('marketplace');
const travelLog          = require('../../../common/models/travelLogModel');
const gameLog            = require('../gameLog');
const EventEmitter       = require('events').EventEmitter;
const _                  = require('lodash');
const {DateTime}         = require('luxon');
let marketplace;
let ferroSocket;

/**
 * Just a logger helper
 * @param gameId
 * @param text
 * @param obj
 */
function marketLog(gameId, text, obj) {
  logger.info(`${gameId}: ${text}`, obj);
}

class Marketplace extends EventEmitter {
  /**
   * Constructor
   * @param scheduler the instance of the gameScheduler, must be defined for the game, can be null for the integration
   *   tests
   * @constructor
   */
  constructor(scheduler) {
    super()
    let self = this;
    EventEmitter.call(this);

    this.scheduler = scheduler;

    if (this.scheduler) {
      /**
       * This is the 'interest' event launched by the gameScheduler
       */
      this.scheduler.on('interest', async function (event) {
        try {
          marketLog(event.gameId, 'Marketplace: onInterest');
          await self.payRents({gameId: event.gameId});
          marketLog(event.gameId, 'Timed interests paid');
          event.callback(null, event);
        }
        catch (err) {
          event.callback(err);
        }
      });
      /**
       * This is the 'prestart' event launched by the gameScheduler. Game is going to start soon, refresh cache
       * Pay start capital
       */
      this.scheduler.on('prestart', async function (event) {
        try {
          marketLog(event.gameId, 'Marketplace: onPrestart');
          await gameCache.refreshCache()
          marketLog(event.gameId, 'Cache refreshed');
          await self.payInitialAsset(event.gameId);
          marketLog(event.gameId, 'Initial assets paid');
          event.callback(null, event);
        }
        catch (err) {
          event.callback(err);
        }
      });

      /**
       * This is the 'start' event launched by the gameScheduler. Nothing is done currently.
       */
      this.scheduler.on('start', async function (event) {
        try {
          marketLog(event.gameId, 'Marketplace: onStart');
          await gameLog.addEntry({
            gameId:    event.gameId,
            category:  gameLog.CAT_GENERAL,
            saveTitle: 'Spielstart'
          });
          event.callback(null, event);
        }
        catch (err) {
          event.callback(err);
        }
      });
      /**
       * This is the 'end' event launched by the gameScheduler. Pay the final rents & interests
       */
      this.scheduler.on('end', async function (event) {
        try {
          marketLog(event.gameId, 'Marketplace: onEnd');
          await self.payFinalRents(event.gameId);
          marketLog(event.gameId, 'Timed interests paid');
          marketLog(event.gameId, 'Marketplace: onStart');
          await gameLog.addEntry({
            gameId:    event.gameId,
            category:  gameLog.CAT_GENERAL,
            saveTitle: 'Spielende'
          })
          event.callback(null, event);
        }
        catch (err) {
          event.callback(err);
        }
      });
    }
  }

  /**
   * Determines whether the marketplace is open or not
   * @param gameplay
   * @param additionalMinutes give a tolerance at the end of the game (as we have to pay final rents)
   */
  isOpen(gameplay, additionalMinutes = 0) {

    let start = DateTime.fromJSDate(gameplay.scheduling.gameStartTs).minus({minutes: additionalMinutes});
    let end   = DateTime.fromJSDate(gameplay.scheduling.gameEndTs).plus({minutes: additionalMinutes});
    if (DateTime.now() > end) {
      marketLog(gameplay.internal.gameId, 'Game over', {
        start:             start.toJSDate(),
        end:               end.toJSDate(),
        additionalMinutes: additionalMinutes
      });
      return false;
    }
    if (DateTime.now() < start) {
      marketLog(gameplay.internal.gameId, 'Game not started yet');
      return false;
    }
    return true;
  }
  ;

  /**
   * Buy a property or at least try to
   * 1) Success: property goes to the team, Money flow:
   *    team->property->bank
   * 2) Already sold: pay taxes, Money:
   *    team->property->owner
   *
   * @param options is the object with the information what to do. At least with gameId, teamId and propertyId
   * @param callback
   */
  async buyProperty(options, callback) {
    const self = this;
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in buyProperty')
      callback(new Error('no callback'));
    }

    if (!_.isString(options.gameId) || !_.isString(options.teamId) || !_.isString(options.propertyId)) {
      logger.info('Rather stupid options for buyProperty', options);
      throw new Error('At least gameId, teamId and property Id must be supplied');
    }

    marketLog(options.gameId, 'buyProperty, team: ' + options.teamId + ' property:' + options.propertyId + ' user:' + options.user);

    const property = await propWrap.getProperty(options.gameId, options.propertyId);
    const logEntry = await travelLog.addPropertyEntry(options.gameId, options.teamId, property);

    if (ferroSocket) {
      ferroSocket.emitToAdmins(options.gameId, 'player-position', logEntry);
      ferroSocket.emitToTeam(options.gameId, options.teamId, 'player-position', logEntry);
    }

    if (!property) {
      throw new Error('No property for this location', {message: 'Dieses Ort kann nicht gekauft werden'});
    }

    const gameData = await gameCache.getGameData(options.gameId);

    let gp   = gameData.gameplay;
    let team = gameData.teams.get(options.teamId);

    if (!gp || !team) {
      throw new Error('Gameplay error or team invalid');
    }

    if (!self.isOpen(gp)) {
      throw new Error(`Marketplace "${options.gameId}" is closed`);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Now check if the property is still available or sold. There are 3 cases to handle
    if (!property.gamedata || !property.gamedata.owner || property.gamedata.owner.length === 0) {
      // CASE 1: property is available, the team is going to buy it
      marketLog(options.gameId, `"${property.location.name}" is available`);
      const info     = await propertyAccount.buyProperty(gp, property, team)
      options.amount = info.amount;
      options.info   = 'Kauf ' + property.location.name;
      await teamAccount.chargeToBank(options);
      await gameLog.addEntry({
        gameId:    options.gameId,
        category:  gameLog.CAT_PROPERTY,
        title:     `"${team.data.name}" kaufen ${property.location.name} für ${info.amount} Fr.`,
        saveTitle: `"${team.data.name}" kaufen ein Ort für ${info.amount} Fr.`,
        options:   {teamId: team.uuid}
      })
      // that's it!
      return {property: property, amount: info.amount};
    }
    //------------------------------------------------------------------------------------------------------------------
    else if (property.gamedata.owner === options.teamId) {
      // CASE 2: property belongs to the team which wants to buy it, do nothing
      marketLog(options.gameId, `"${property.location.name}" already belongs the team`);
      return {property: property, amount: 0};
    }
    //------------------------------------------------------------------------------------------------------------------
    else {
      // CASE 3: property belongs to another team, pay the rent
      marketLog(options.gameId, `"${property.location.name}" is already sold to another team`);
      const info = propertyAccount.chargeRent(gp, property, options.teamId);

      let targetTeam = _.get(gameData.teams[info.owner], 'data.name', 'unbekannt');
      await gameLog.addEntry({
        gameId:    options.gameId,
        category:  gameLog.CAT_PROPERTY,
        title:     `"${team.data.name}" zahlen für ${property.location.name} Miete an "${targetTeam}": ${info.amount} Fr.`,
        saveTitle: `"${team.data.name}" zahlen ${info.amount} Fr. Miete an "${targetTeam}"`,
        options:   {teamId: team.uuid}
      });
      return info;
    }
  }
  ;

  /**
   * Build houses for all porperties of a team
   * Same money flow as buildHouse
   * @param gameId
   * @param teamId
   * @param callback
   */
  async buildHouses(gameId, teamId, callback) {
    let self = this;
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in buildHouses')
      callback(new Error('no callback'));
    }

    const res = await gameCache.getGameData(gameId);
    let gp   = res.gameplay;
    let team = res.teams.get(teamId);

    if (!gp || !team) {
      throw new Error('Gameplay error or team invalid');
    }

    const properties = await propWrap.getTeamProperties(gameId, teamId);

    if (properties.length === 0) {
      marketLog(gameId, 'nothing to build');
      return {amount: 0, log: []};
    }

    if (!self.isOpen(gp)) {
      throw new Error(`Marketplace "${gameId}" is closed, can't build houses.`);
    }

    let log = [];

    for (const property of properties) {
      const info = await propertyAccount.buyBuilding(gp, property, team);
      if (info.success) {
        log.push(info);
      }
    }

    let totalAmount = 0;
    for (let t = 0; t < log.length; t++) {
      totalAmount += log[t].amount;
    }
    if (totalAmount === 0) {
      // fine, we tried to build, but there was nothing to build
      return {amount: 0, log: []};
    }

    await teamAccount.chargeToBank({
      teamId: teamId,
      gameId: gameId,
      amount: totalAmount,
      info:   {info: 'Hausbau', parts: log}
    });
    return {amount: totalAmount, log: log}
  }
  ;


  /**
   * Build a house for a single property
   * Same money flow as buildHouse
   * @param gameId
   * @param teamId
   * @param propertyId
   * @param callback
   */
  async buildHouse(gameId, teamId, propertyId, callback) {
    let self = this;
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in buildHouse')
      callback(new Error('no callback'));
    }

    const property = await propWrap.getProperty(gameId, propertyId);

    if (!property) {
      throw new Error(`Property ${propertyId} for ${teamId} in ${gameId} not found`);
    }

    if (property.gamedata.owner !== teamId) {
      marketLog(gameId, 'Property ' + property.location.name + ' does not belong this team, building not allowed');
      throw new Error('Team does not possess this property');
    }

    const res = await gameCache.getGameData(gameId);

    let gp   = res.gameplay;
    let team = res.teams.get(teamId);

    if (!gp || !team) {
      throw new Error('Gameplay error or team invalid');
    }

    if (!self.isOpen(gp)) {
      throw new Error(`Marketplace "${gameId}" is closed, can't build house.`);
    }

    const info = await propertyAccount.buyBuilding(gp, property, team);

    await teamAccount.chargeToBank({
      teamId: teamId,
      gameId: gameId,
      amount: info.amount,
      info:   {info: 'Hausbau ' + property.location.name}
    })
    return {amount: info.amount};
  }
  ;

  /**
   * Pays the initial assets of a game. This is usually done before the market opens
   * @param gameId
   * @param callback
   */
  async payInitialAsset(gameId, callback) {
    let self = this;
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in payInitialAsset')
      callback(new Error('no callback'));
    }
    const res = await gameCache.getGameData(gameId)

    let gp    = res.gameplay;
    let teams = res.teams.values();

    if (!self.isOpen(gp, 15)) {
      throw new Error(`Marketplace "${gameId}" is closed`);
    }

    for (const team of teams) {
      await teamAccount.receiveFromBank(team.uuid, gameId, gp.gameParams.startCapital, 'Startkapital');
    }
  };

  /**
   * Pays the final interests in a game. The number of them was defined in the editor.
   * @param gameId
   * @param callback
   */
  async payFinalRents(gameId, callback) {
    let self = this;
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in payFinalRents')
      callback(new Error('no callback'));
    }
    const res     = await gameCache.getGameData(gameId);
    let gp        = res.gameplay;
    let tolerance = 10; // in minutes

    if (gp.gameParams.interestCyclesAtEndOfGame < 1) {
      // No cycles, no interests, return
      return null;
    }

    // give a tolerance of a few minutes for closing the market place
    if (!self.isOpen(gp, tolerance)) {
      marketLog(gp.internal.gameId, 'Tolerance: ' + tolerance);
      throw new Error(`Marketplace "${gameId}" is closed, can't pay final rent.`);
    }

    for (let i = 0; i < gp.gameParams.interestCyclesAtEndOfGame; i++) {
      await self.payRents({gameId: gameId, tolerance: tolerance});
    }
  }
  ;

  /**
   * Pay Interest (this is the fix value) for all teams.
   * Money: bank->team
   *
   * @param gameId
   * @param tolerance
   * @param callback
   */
  async payInterests(gameId, tolerance, callback) {
    let self = this;
    if (_.isFunction(tolerance)) {
      callback  = tolerance;
      tolerance = 0;
    }

    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in payInterests')
      callback(new Error('no callback'));
    }

    const res = await gameCache.getGameData(gameId)

    let gp    = res.gameplay;
    let teams = res.teams.values();

    if (!self.isOpen(gp, tolerance)) {
      throw new Error(`Marketplace "${gameId}" is closed, can't pay interests.`);
    }

    for (const team of teams) {
      await teamAccount.payInterest(team.uuid, gameId, gp.gameParams.interest);
    }
  }

  /**
   * Checks for a negative asset and pays to the chancellery if so
   * @param gameId
   * @param tolerance
   * @param callback
   */
  async checkNegativeAsset(gameId, tolerance, callback) {

    let self = this;
    if (_.isFunction(tolerance)) {
      callback  = tolerance;
      tolerance = 0;
    }

    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in checkNegativeAsset')
      callback(new Error('no callback'));
    }

    const res = await gameCache.getGameData(gameId);

    let gp    = res.gameplay;
    let teams = res.teams.values();

    if (!self.isOpen(gp, tolerance)) {
      throw new Error(`Marketplace "${gameId}" is closed so there are no negative assets.`);
    }

    for (const team of teams) {
      const info = await teamAccount.negativeBalanceHandling(gameId, team.uuid, gp.gameParams.debtInterest);
      if (info && info.amount !== 0) {
        marketLog(gameId, 'negativeBalanceHandlingResult', info);
        await chancelleryAccount.payToChancellery(gp, team, info.amount, 'Strafzins (negatives Guthaben)');
        return;
      }
    }
  }
  ;

  /**
   * Pays the rents (each hour) for a team
   * @param gp
   * @param team
   * @param tolerance
   * @param callback
   */
  async payRentsForTeam(gp, team, tolerance, callback) {
    if (_.isFunction(tolerance)) {
      callback  = tolerance;
      tolerance = 0;
    }

    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in payRentsForTeam')
      callback(new Error('no callback'));
    }

    if (!this.isOpen(gp, tolerance)) {
      throw new Error(`Marketplace "${_.get(gp, 'internal.gameId')}" is closed, no rent for team`);
    }

    const info = await propertyAccount.getRentRegister(gp, team)
    await propertyAccount.payInterest(gp, info.register);
    if (info.totalAmount > 0) {
      await teamAccount.receiveFromBank(info.teamId, gp.internal.gameId, info.totalAmount, {
        info:  'Grundstückzins',
        parts: info.register
      });
    }
  }
  ;

  /**
   * Pays the rents (interests and rents) for all teams, also releasing the buildingEnabled lock for the next round
   * If the team has debts, a percentage of it will be payed too.
   *
   * Money: bank->propertIES->team
   * @param options is an object with at least the gameId and a tolerance (in minutes for market open), if given
   * @param callback
   */
  async payRents(options, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in payRents')
      callback(new Error('no callback'));
    }
    let gameId    = options.gameId;
    let tolerance = options.tolerance || 0;

    if (!gameId) {
      throw new Error('no gameId supplied in payRents');
    }

    let self = this;

    const res = await gameCache.getGameData(gameId);

    let gp    = res.gameplay;
    let teams = res.teams.values();

    if (!gp) {
      throw new Error('Gameplay with id ' + gameId + ' not found (payRents)');
    }

    if (!self.isOpen(gp, tolerance)) {
      throw new Error(`Marketplace "${gameId}" is closed, no rents for all.`);
    }

    // check negative asset and pay rent
    await self.checkNegativeAsset(gameId, tolerance);

    await self.payInterests(gameId, tolerance);

    const nbAffected = await propWrap.allowBuilding(gameId)
    if (ferroSocket) {
      // Inform clients that they can build again
      ferroSocket.emitToGame(gameId, 'checkinStore', propertyActions.buildingAllowedAgain());
    }
    marketLog(gameId, 'Building allowed again for ' + nbAffected.toString() + ' buildings');

    for (const team of teams) {
      await self.payRentsForTeam(gp, team, tolerance);
    }

    if (ferroSocket) {
      // Inform clients that the can build again
      ferroSocket.emitToGame(gameId, 'general', {message: 'Die Mieten wurden ausbezahlt'});
    }
  }
  ;

  /**
   * Chancellery, every time a team calls (be sure that they are on the line,
   * no false alarms: only call the function when really editing the team).
   *
   * You can lose or win a random amount, or you can even win the jackpot
   *
   * Money: team->chancellery   (negative amount)
   *        bank->team          (positive amount)
   *
   * @param gameId
   * @param teamId
   * @param callback
   */
  async chancellery(gameId, teamId, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in chancellery')
      callback(new Error('no callback'));
    }
    let self = this;

    const res = await gameCache.getGameData(gameId);
    let gp    = res.gameplay;
    let team  = res.teams.get(teamId);

    if (!self.isOpen(gp)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, no more chancellery.`));
    }

    return await chancelleryAccount.playChancellery(gp, team);
  }

  /**
   * Chancellery Game: either you win or you loose. Usually only loosing money
   * is taken into account, rising the value of the chancellery
   *
   * Money: team->chancellery   (negative amount)
   *        bank->team          (positive amount)
   *
   * @param gameId
   * @param teamId
   * @param amount
   * @param callback
   */
  async chancelleryGamble(gameId, teamId, amount, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in chancelleryGamble')
      callback(new Error('no callback'));
    }

    let self = this;

    const res = await gameCache.getGameData(gameId);
    let gp    = res.gameplay;
    let team  = res.teams.get(teamId);

    if (!self.isOpen(gp)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, gambling is over.`));
    }

    return chancelleryAccount.gamble(gp, team, amount);
  }

  /**
   * A very exceptional case, but might be needed: increasing or decreasing
   * the account of a team due to an error, penalty or whatsoever
   *
   * @param gameId
   * @param teamId
   * @param amount
   * @param reason
   * @param callback
   */
  async manipulateTeamAccount(gameId, teamId, amount, reason, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in manipulateTeamAccount')
      callback(new Error('no callback'));
    }

    if (!reason) {
      throw new Error('reason must be supplied');
    }

    if (amount > 0) {
      return await teamAccount.receiveFromBank(teamId, gameId, amount, 'Manuelle Gutschrift: ' + reason);
    } else {
      return await teamAccount.chargeToBank({
        teamId: teamId,
        gameId: gameId,
        amount: amount,
        info:   'Manuelle Lastschrift: ' + reason
      })
    }
  }
  ;

  /**
   * Resets a property: removes the owner and buildings. Use only, if you have bought a property by mistake
   * for a team. The affected teams account is not touched.
   *
   * @param gameId
   * @param propertyId
   * @param reason
   * @param callback
   * @returns {*}
   */
  async resetProperty(gameId, propertyId, reason, callback) {
    if (callback) {
      logger.info('>>>>>>>>>> callback ist not supported in resetProperty')
      callback(new Error('no callback'));
    }

    if (!reason) {
      throw new Error('reason must be supplied');
    }

    const prop = await propWrap.getProperty(gameId, propertyId);
    await propertyAccount.resetProperty(gameId, prop, reason);
  }
}

module.exports = {
  /**
   * Create a marketplace. This should be done only once, afterward get it using getMarketplace
   * @param scheduler
   * @returns {Marketplace}
   */
  createMarketplace: function (scheduler) {
    marketplace = new Marketplace(scheduler);

    teamAccount.init();
    propertyAccount.init();
    propWrap.init();
    chancelleryAccount.init();

    ferroSocket = require('../ferroSocket').get();
    gameLog.initSocket(ferroSocket);

    return marketplace;
  },
  /**
   * Gets the marketplace, throws an error, if not defined
   * @returns {*}
   */
  getMarketplace: function () {
    if (!marketplace) {
      throw new Error('You must create a marketplace first before getting it');
    }
    return marketplace;
  }
};
