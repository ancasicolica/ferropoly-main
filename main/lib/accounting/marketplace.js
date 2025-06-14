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
const async              = require('async');
const moment             = require('moment');
const EventEmitter       = require('events').EventEmitter;
const util               = require('util');
const _                  = require('lodash');
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

/**
 * Constructor
 * @param scheduler the instance of the gameScheduler, must be defined for the game, can be null for the integration tests
 * @constructor
 */
function Marketplace(scheduler) {
  let self = this;
  EventEmitter.call(this);

  this.scheduler = scheduler;

  if (this.scheduler) {
    /**
     * This is the 'interest' event launched by the gameScheduler
     */
    this.scheduler.on('interest', function (event) {
      marketLog(event.gameId, 'Marketplace: onInterest');
      self.payRents({gameId: event.gameId}, function (err) {
        if (err) {
          marketLog(event.gameId, 'ERROR, interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        marketLog(event.gameId, 'Timed interests paid');
        event.callback(null, event);
      });
    });
    /**
     * This is the 'prestart' event launched by the gameScheduler. Game is going to start soon, refresh cache
     * Pay start capital
     */
    this.scheduler.on('prestart', function (event) {
      marketLog(event.gameId, 'Marketplace: onPrestart');
      gameCache.refreshCache(function (err) {
        marketLog(event.gameId, 'Cache refreshed', err);
        self.payInitialAsset(event.gameId, function (err) {
          if (err) {
            marketLog(event.gameId, 'ERROR, initial assets not paid! Message: ' + err.message);
            event.callback(err);
            return;
          }
          marketLog(event.gameId, 'Initial assets paid');
          event.callback(null, event);
        });
      });
    });
    /**
     * This is the 'start' event launched by the gameScheduler. Nothing is done currently.
     */
    this.scheduler.on('start', function (event) {
      marketLog(event.gameId, 'Marketplace: onStart');
      gameLog.addEntry({
        gameId   : event.gameId,
        category : gameLog.CAT_GENERAL,
        saveTitle: 'Spielstart'
      }, event.callback(null, event));
    });
    /**
     * This is the 'end' event launched by the gameScheduler. Pay the final rents & interests
     */
    this.scheduler.on('end', function (event) {
      marketLog(event.gameId, 'Marketplace: onEnd');
      self.payFinalRents(event.gameId, function (err) {
        if (err) {
          marketLog(event.gameId, 'ERROR, final interests not paid! Message: ' + err.message);
          event.callback(err);
          return;
        }
        marketLog(event.gameId, 'Timed interests paid');
        marketLog(event.gameId, 'Marketplace: onStart');
        gameLog.addEntry({
          gameId   : event.gameId,
          category : gameLog.CAT_GENERAL,
          saveTitle: 'Spielende'
        }, event.callback(null, event));
      });
    });
  }
}

util.inherits(Marketplace, EventEmitter);

/**
 * Determines whether the marketplace is open or not
 * @param gameplay
 * @param additionalMinutes give a tolerance at the end of the game (as we have to pay final rents)
 */
Marketplace.prototype.isOpen = function (gameplay, additionalMinutes) {
  if (_.isUndefined(additionalMinutes)) {
    additionalMinutes = 0;
  }

  let start = moment(gameplay.scheduling.gameStartTs).subtract(additionalMinutes, 'minutes');
  let end   = moment(gameplay.scheduling.gameEndTs).add(additionalMinutes, 'minutes');
  if (moment().isAfter(end)) {
    marketLog(gameplay.internal.gameId, 'Game over', {
      start            : start.toDate(),
      end              : end.toDate(),
      additionalMinutes: additionalMinutes
    });
    return false;
  }
  if (moment().isBefore(start)) {
    marketLog(gameplay.internal.gameId, 'Game not started yet');
    return false;
  }
  return true;
};

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
Marketplace.prototype.buyProperty = function (options, callback) {
  const self = this;
  if (!options.gameId || !options.teamId || !options.propertyId) {
    logger.info('Rather stupid options for buyProperty', options);
    return callback(new Error('At least gameId, teamId and property Id must be supplied'));
  }

  marketLog(options.gameId, 'buyProperty, team: ' + options.teamId + ' property:' + options.propertyId + ' user:' + options.user);

  propWrap.getProperty(options.gameId, options.propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }
    travelLog.addPropertyEntry(options.gameId, options.teamId, property, function (err, logEntry) {
      // we do not care about this return, it's asynchronous and that's ok
      if (err) {
        logger.error(`${options.gameId}: addPropertyEntry returned error`, err);
      } else {
        ferroSocket.emitToAdmins(options.gameId, 'player-position', logEntry);
        ferroSocket.emitToTeam(options.gameId, options.teamId, 'player-position', logEntry);
      }
    });
    if (!property) {
      return callback(new Error('No property for this location'), {message: 'Dieses Ort kann nicht gekauft werden'});
    }
    gameCache.getGameData(options.gameId, function (err, gameData) {
      if (err) {
        logger.error(`${options.gameId}: getGameData returned error`, err);
        return callback(err);
      }
      let gp   = gameData.gameplay;
      let team = gameData.teams[options.teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error(`Marketplace "${options.gameId}" is closed`));
      }

      //------------------------------------------------------------------------------------------------------------------
      // Now check if the property is still available or sold. There are 3 cases to handle
      if (!property.gamedata || !property.gamedata.owner || property.gamedata.owner.length === 0) {
        // CASE 1: property is available, the team is going to buy it
        marketLog(options.gameId, `"${property.location.name}" is available`);
        propertyAccount.buyProperty(gp, property, team, function (err, info) {
          if (err) {
            logger.error(`${options.gameId}: buyProperty returned error`, err);
            return callback(err);
          }
          options.amount = info.amount;
          options.info   = 'Kauf ' + property.location.name;
          teamAccount.chargeToBank(options, function (err) {
            if (err) {
              return callback(err, {message: 'Fehler beim Grundstückkauf'});
            }
            gameLog.addEntry({
              gameId   : options.gameId,
              category : gameLog.CAT_PROPERTY,
              title    : `"${team.data.name}" kaufen ${property.location.name} für ${info.amount} Fr.`,
              saveTitle: `"${team.data.name}" kaufen ein Ort für ${info.amount} Fr.`,
              options  : {teamId: team.uuid}
            }, () => {
              // that's it!
              return callback(null, {property: property, amount: info.amount});
            });
          });
        });
      }
      //------------------------------------------------------------------------------------------------------------------
      else if (property.gamedata.owner === options.teamId) {
        // CASE 2: property belongs to the team which wants to buy it, do nothing
        marketLog(options.gameId, `"${property.location.name}" already belongs the team`);
        return callback(null, {property: property, amount: 0});
      }
      //------------------------------------------------------------------------------------------------------------------
      else {
        // CASE 3: property belongs to another team, pay the rent
        marketLog(options.gameId, `"${property.location.name}" is already sold to another team`);
        propertyAccount.chargeRent(gp, property, options.teamId, (err, info) => {
          if (err) {
            return callback(err, {message: 'Fehler beim Grundstückkauf'});
          }
          let targetTeam = _.get(gameData.teams[info.owner], 'data.name', 'unbekannt');
          gameLog.addEntry({
            gameId   : options.gameId,
            category : gameLog.CAT_PROPERTY,
            title    : `"${team.data.name}" zahlen für ${property.location.name} Miete an "${targetTeam}": ${info.amount} Fr.`,
            saveTitle: `"${team.data.name}" zahlen ${info.amount} Fr. Miete an "${targetTeam}"`,
            options  : {teamId: team.uuid}
          }, () => {
            // that's it!
            return callback(null, info);
          });
        });
      }
    });
  });
};

/**
 * Build houses for all porperties of a team
 * Same money flow as buildHouse
 * @param gameId
 * @param teamId
 * @param callback
 */
Marketplace.prototype.buildHouses = function (gameId, teamId, callback) {
  let self = this;

  propWrap.getTeamProperties(gameId, teamId, function (err, properties) {
    if (err) {
      return callback(err);
    }

    if (properties.length === 0) {
      marketLog(gameId, 'nothing to build');
      return callback(null, {amount: 0, log: []});
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(`${gameId}: getGameData returned error`, err);
        return callback(err);
      }
      let gp   = res.gameplay;
      let team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error(`Marketplace "${gameId}" is closed, can't build houses.`));
      }

      let log     = [];
      let handled = 0;

      // Callback when buying building
      let buyBuildingCallback = function (err, info) {
        if (err) {
          marketLog(gameId, err);
        } else {
          log.push(info);
        }
        handled++;
        if (handled === properties.length) {
          let totalAmount = 0;
          for (let t = 0; t < log.length; t++) {
            totalAmount += log[t].amount;
          }
          if (totalAmount === 0) {
            // fine, we tried to build but there was nothing to build
            return callback(null, {amount: 0});
          } else {
            teamAccount.chargeToBank({
              teamId: teamId,
              gameId: gameId,
              amount: totalAmount,
              info  : {info: 'Hausbau', parts: log}
            }, function (err) {
              if (err) {
                logger.error(`${gameId}: chargeToBank returned error`, err);
                return callback(err);
              }
              return callback(null, {amount: totalAmount, log: log});
            });
          }
        }
      };

      // Todo: use async instead of for loop
      for (let i = 0; i < properties.length; i++) {
        propertyAccount.buyBuilding(gp, properties[i], team, buyBuildingCallback);
      }
    });
  });
};


/**
 * Build a house for a single property
 * Same money flow as buildHouse
 * @param gameId
 * @param teamId
 * @param propertyId
 * @param callback
 */
Marketplace.prototype.buildHouse = function (gameId, teamId, propertyId, callback) {
  let self = this;

  propWrap.getProperty(gameId, propertyId, function (err, property) {
    if (err) {
      return callback(err);
    }

    if (!property) {
      return callback(new Error(`Property ${propertyId} for ${teamId} in ${gameId} not found`));
    }

    if (property.gamedata.owner !== teamId) {
      marketLog(gameId, 'Property ' + property.location.name + ' does not belong this team, building not allowed');
      return callback(new Error('Team does not possess this property'));
    }

    gameCache.getGameData(gameId, function (err, res) {
      if (err) {
        logger.error(`${gameId}: getGameData returned error`, err);
        return callback(err);
      }
      let gp   = res.gameplay;
      let team = res.teams[teamId];

      if (!gp || !team) {
        return callback(new Error('Gameplay error or team invalid'));
      }

      if (!self.isOpen(gp)) {
        return callback(new Error(`Marketplace "${gameId}" is closed, can't build house.`));
      }

      propertyAccount.buyBuilding(gp, property, team, function (err, info) {
        if (err) {
          marketLog(gameId, err);
          return callback(err);
        }

        teamAccount.chargeToBank({
          teamId: teamId,
          gameId: gameId,
          amount: info.amount,
          info  : {info: 'Hausbau ' + property.location.name}
        }, function (err) {
          if (err) {
            logger.error(`${gameId}: chargeToBank returned error`, err);
            return callback(err);
          }
          return callback(null, {amount: info.amount});
        });
      });
    });
  });
};

/**
 * Pays the initial assets of a game. This is usually done before the market opens
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payInitialAsset = function (gameId, callback) {
  let self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp    = res.gameplay;
    let teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, 15)) {
      return callback(new Error(`Marketplace "${gameId}" is closed`));
    }

    async.each(teams, function (team, callback) {
        teamAccount.receiveFromBank(team.uuid, gameId, gp.gameParams.startCapital, 'Startkapital', callback);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Pays the final interests in a game. The number of them was defined in the editor.
 * @param gameId
 * @param callback
 */
Marketplace.prototype.payFinalRents = function (gameId, callback) {
  let self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp        = res.gameplay;
    let tolerance = 10; // in minutes
    let count     = 0;

    if (gp.gameParams.interestCyclesAtEndOfGame < 1) {
      // No cycles, no interests, return
      return callback(null);
    }

    // give a tolerance of a few minutes for closing the market place
    if (!self.isOpen(gp, tolerance)) {
      marketLog(gp.internal.gameId, 'Tolerance: ' + tolerance);
      return callback(new Error(`Marketplace "${gameId}" is closed, can't pay final rent.`));
    }

    async.whilst(
      function (cb) {
        return cb(null, count < gp.gameParams.interestCyclesAtEndOfGame);
      },
      function (cb) {
        count++;
        self.payRents({gameId: gameId, tolerance: tolerance}, cb);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Pay Interest (this is the fix value) for all teams.
 * Money: bank->team
 *
 * @param gameId
 * @param tolerance
 * @param callback
 */
Marketplace.prototype.payInterests = function (gameId, tolerance, callback) {
  let self = this;
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp    = res.gameplay;
    let teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, tolerance)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, can't pay interests.`));
    }

    async.each(teams, function (team, callback) {
        teamAccount.payInterest(team.uuid, gameId, gp.gameParams.interest, callback);
      },
      function (err) {
        callback(err);
      }
    );
  });
};

/**
 * Checks for a negative asset and pays to the chancellery if so
 * @param gameId
 * @param tolerance
 * @param callback
 */
Marketplace.prototype.checkNegativeAsset = function (gameId, tolerance, callback) {
  let self = this;
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp    = res.gameplay;
    let teams = _.valuesIn(res.teams);

    if (!self.isOpen(gp, tolerance)) {
      return callback(new Error(`Marketplace "${gameId}" is closed so there are no negative assets.`));
    }

    async.each(teams, function (team, cb) {
      teamAccount.negativeBalanceHandling(gameId, team.uuid, gp.gameParams.debtInterest, function (err, info) {
        if (err) {
          return cb(err);
        }
        if (info && info.amount !== 0) {
          marketLog(gameId, 'negativeBalanceHandlingResult', info);
          chancelleryAccount.payToChancellery(gp, team, info.amount, 'Strafzins (negatives Guthaben)', cb);
          return;
        }
        cb();
      });
    }, function (err) {
      callback(err);
    });
  });
};

/**
 * Pays the rents (each hour) for a team
 * @param gp
 * @param team
 * @param tolerance
 * @param callback
 */
Marketplace.prototype.payRentsForTeam = function (gp, team, tolerance, callback) {
  if (_.isFunction(tolerance)) {
    callback  = tolerance;
    tolerance = 0;
  }

  if (!this.isOpen(gp, tolerance)) {
    return callback(new Error(`Marketplace "${_.get(gp, 'internal.gameId')}" is closed, no rent for team`));
  }

  propertyAccount.getRentRegister(gp, team, function (err, info) {
    if (err) {
      marketLog(gp.internal.gameId, 'error in getRentRegister', err);
      return callback(err);
    }
    propertyAccount.payInterest(gp, info.register, function (err) {
      if (err) {
        marketLog(gp.internal.gameId, 'error in payInterest', err);
        return callback(err);
      }
      if (info.totalAmount > 0) {
        teamAccount.receiveFromBank(info.teamId, gp.internal.gameId, info.totalAmount, {
          info : 'Grundstückzins',
          parts: info.register
        }, function (err) {
          return callback(err);
        });
      } else {
        return callback(err);
      }
    });
  });
};

/**
 * Pays the rents (interests and rents) for all teams, also releasing the buildingEnabled lock for the next round
 * If the team has debts, a percentage of it will be payed too.
 *
 * Money: bank->propertIES->team
 * @param options is an object with at least the gameId and a tolerance (in minutes for market open), if given
 * @param callback
 */
Marketplace.prototype.payRents = function (options, callback) {
  let gameId    = options.gameId;
  let tolerance = options.tolerance || 0;

  if (!gameId) {
    return callback(new Error('no gameId supplied in payRents'));
  }

  let self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp    = res.gameplay;
    let teams = _.valuesIn(res.teams);

    if (!gp) {
      return callback(new Error('Gameplay with id ' + gameId + ' not found (payRents)'));
    }

    if (!self.isOpen(gp, tolerance)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, no rents for all.`));
    }

    // check negative asset and pay rent
    self.checkNegativeAsset(gameId, tolerance, function (err) {
      if (err) {
        return callback(err);
      }

      self.payInterests(gameId, tolerance, function (err) {
        if (err) {
          return callback(err);
        }

        propWrap.allowBuilding(gameId, function (err, nbAffected) {
          if (err) {
            return callback(err);
          }
          if (ferroSocket) {
            // Inform clients that the can build again
            ferroSocket.emitToGame(gameId, 'checkinStore', propertyActions.buildingAllowedAgain());
          }
          marketLog(gameId, 'Building allowed again for ' + nbAffected.toString() + ' buildings');

          async.each(teams, function (team, callback) {
              self.payRentsForTeam(gp, team, tolerance, callback);
            },
            function (err) {
              if (ferroSocket) {
                // Inform clients that the can build again
                ferroSocket.emitToGame(gameId, 'general', {message: 'Die Mieten wurden ausbezahlt'});
              }
              callback(err);
            }
          );
        });
      });
    });
  });
};

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
Marketplace.prototype.chancellery = function (gameId, teamId, callback) {
  let self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp   = res.gameplay;
    let team = res.teams[teamId];

    if (!self.isOpen(gp)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, no more chancellery.`));
    }

    chancelleryAccount.playChancellery(gp, team, function (err, res) {
      callback(err, res);
    });
  });
};

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
Marketplace.prototype.chancelleryGamble = function (gameId, teamId, amount, callback) {
  let self = this;

  gameCache.getGameData(gameId, function (err, res) {
    if (err) {
      logger.error(`${gameId}: getGameData returned error`, err);
      return callback(err);
    }
    let gp   = res.gameplay;
    let team = res.teams[teamId];

    if (!self.isOpen(gp)) {
      return callback(new Error(`Marketplace "${gameId}" is closed, gambling is over.`));
    }

    chancelleryAccount.gamble(gp, team, amount, function (err, res) {
      callback(err, res);
    });
  });
};


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
Marketplace.prototype.manipulateTeamAccount = function (gameId, teamId, amount, reason, callback) {
  if (!reason) {
    return callback(new Error('reason must be supplied'));
  }

  if (amount > 0) {
    teamAccount.receiveFromBank(teamId, gameId, amount, 'Manuelle Gutschrift: ' + reason, function (err) {
      callback(err);
    });
  } else {
    teamAccount.chargeToBank({
      teamId: teamId,
      gameId: gameId,
      amount: amount,
      info  : 'Manuelle Lastschrift: ' + reason
    }, function (err) {
      callback(err);
    });

  }
};

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
Marketplace.prototype.resetProperty = function (gameId, propertyId, reason, callback) {
  if (!reason) {
    return callback(new Error('reason must be supplied'));
  }

  propWrap.getProperty(gameId, propertyId, function (err, prop) {
    if (err) {
      return callback(err);
    }
    propertyAccount.resetProperty(gameId, prop, reason, function (err) {
      callback(err);
    });
  });
};

module.exports = {
  /**
   * Create a marketplace. This should be done only once, afterwards get it using getMarketplace
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
