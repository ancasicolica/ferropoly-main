/**
 * The property account is for statistical purposes: how much did a team invest into a property?
 * how much did it get out from it?
 *
 * The following values are taken into account:
 * - buying the property
 * - interests every hour
 * - buying a house / hotel
 * - rents from other teams
 *
 * Created by kc on 20.04.15.
 */

const propWrap            = require('../propertyWrapper');
const propertyTransaction = require('../../../common/models/accounting/propertyTransaction');
const teamAccount         = require('./teamAccount');
const logger              = require('../../../common/lib/logger').getLogger('propertyAccount');
const _                   = require('lodash');
const {DateTime}          = require('luxon');
const {
        TEAM_TRANSACTION_RENT,
        TEAM_TRANSACTION_PURCHASE_PROPERTY
      }                   = require('../../../common/models/accounting/teamAccountTransactionTypes');

let ferroSocket;

/**
 * Buy a property. The property must be free. The function returns an object with the information when successful,
 * if the property is not available, null is returned
 * @param gameplay
 * @param property is the property itself, not the ID
 * @param team the team is buying
 * @param callback
 */
async function buyProperty(gameplay, property, team, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in buyProperty');
    return callback(new Error('no callback'));
  }

  if (!gameplay.internal?.gameId) {
    logger.warn('No gameId supplied in buyProperty');
    return null;
  }

  if (!(!property.gamedata || !property.gamedata.owner || property.gamedata.owner === '')) {
    // This property already belongs to someone, we do not accept it
    logger.info(`${_.get(gameplay, 'internal.gameId')} : Can not buy property ${_.get(property, 'location.name')}, it's not free`, {
      gameplay: _.get(gameplay, 'internal.gameId'),
      property
    });
    return null;
  }

  // Set the data
  property.gamedata = {
    owner:     team.uuid,
    boughtTs:  new Date(),
    buildings: 0
  };
  await propWrap.updateProperty(property)

  let retVal = {
    amount: property.pricelist.price
  };

  let pt           = new propertyTransaction.Model();
  pt.gameId        = gameplay.internal.gameId;
  pt.propertyId    = property.uuid;
  pt.sponsorTeamId = team.uuid;
  pt.amount        = (-1) * retVal.amount;
  pt.info          = 'Kauf';

  pt.transaction = {
    origin: {
      uuid:     team.uuid,
      category: 'team'
    },
    amount: (-1) * retVal.amount, // buy is negative earning on the property
    info:   'Kauf',
    type:   TEAM_TRANSACTION_PURCHASE_PROPERTY
  };

  await propertyTransaction.book(pt);
  if (ferroSocket) {
    ferroSocket.emitToAdmins(gameplay.internal.gameId, 'admin-propertyAccount', {
      cmd:         'propertyBought',
      property:    property,
      transaction: pt
    });

    ferroSocket.emitToTeam(gameplay.internal.gameId, team.uuid, 'team-property-update', property);
  }
  return retVal;
}

/**
 * Charges rent for a property:
 *   Visitor pays to Owner, same value also added to the property Account
 *
 * @param gp
 * @param property
 * @param teamId
 * @param callback
 */
async function chargeRent(gp, property, teamId, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in chargeRent');
    return callback(new Error('no callback'));
  }

  if (!property.gamedata.owner) {
    logger.info(`${gp.internal.gameId}: Property ${property.location.name} not sold yet! Not charging any rent.`);
    return {property: property, owner: null, amount: 0};
  }

  if (property.gamedata?.owner === teamId) {
    logger.info(`${gp.internal.gameId}: Team already owns ${property.location.name}, no rent paid.`);
    return {property: property, owner: property.gamedata.owner, amount: 0};
  }

  const val = await getPropertyValue(gp, property);

  let options = {
    gameId:         gp.internal.gameId,
    amount:         val.amount,
    info:           'Miete ' + property.location.name,
    debitorTeamId:  teamId,
    creditorTeamId: property.gamedata.owner,
    type:           TEAM_TRANSACTION_RENT
  };

  // Charge value to the other team
  const info = await teamAccount.chargeToAnotherTeam(options);

  // Add entry for property (income)
  let pt             = new propertyTransaction.Model();
  pt.gameId          = options.gameId;
  pt.propertyId      = property.uuid;
  pt.receivingTeamId = property.gamedata.owner;
  pt.sponsorTeamId   = teamId;
  pt.amount          = info.amount;
  pt.info            = 'Miete';
  pt.transaction     = {
    origin: {
      category: 'team'
    },
    amount: info.amount,
    info:   'Miete',
    type:   TEAM_TRANSACTION_RENT
  };

  await propertyTransaction.book(pt);

  if (ferroSocket) {
    ferroSocket.emitToAdmins(options.gameId, 'admin-propertyAccount', {
      cmd:         'rent',
      property:    property,
      transaction: pt
    });

    ferroSocket.emitToTeam(options.gameId, property.gamedata.owner, 'team-property-account', {
      property,
      transaction: {amount: info.amount, info: pt.info}
    });
  }

  return {property: property, owner: property.gamedata.owner, amount: info.amount};
}

/**
 * Resets a property: deletes the owner and the saldo of the property and reverses all the bookings
 * @param gameId
 * @param property
 * @param reason
 */
async function resetProperty(gameId, property, reason) {

  property.gamedata.buildingEnabled = false;
  property.gamedata.buildings       = 0;
  property.gamedata.owner           = undefined;
  property.gamedata.boughtTs        = undefined;

  await propWrap.updateProperty(property);

  const transactions = await propertyTransaction.getEntries(gameId, property.uuid);

  let count = 0;
  for (const transaction of transactions) {
    const ts = DateTime.fromJSDate(transaction.timestamp).toFormat('HH:mm:ss');
    if (transaction.sponsorTeamId) {
      // A team spent money into the property - pay it back
      await teamAccount.receiveFromBank(
        transaction.sponsorTeamId,
        gameId,
        Math.abs(transaction.amount),
        `Storno Buchung ${ts} für Ort ${property.location.name}; Buchungstext: "${transaction.info}"; Grund: ${reason}`,
        transaction.transaction.type);
      count++;
    }
    if (transaction.receivingTeamId) {
      // A team received money - get it back
      await teamAccount.chargeToBank({
        teamId: transaction.receivingTeamId,
        gameId,
        amount: Math.abs(transaction.amount),
        info:   `Storno Buchung ${ts} für Ort ${property.location.name}; Buchungstext: "${transaction.info}"; Grund: ${reason}`,
        type:   transaction.type
      });
      count++;
    }

    // Delete property transaction
    await propertyTransaction.Model.deleteOne({_id: transaction._id});
  }

  logger.info(`${gameId} : Property '${property.location.name}' reseted, reason: '${reason}'`);

  if (ferroSocket) {
    ferroSocket.emitToAdmins(gameId, 'admin-propertyAccount', {
      cmd:      'propertyReset',
      property: property
    });

  }

  return {transactionNb: count};
}


/**
 * Handles the process of building a property in the game, verifies ownership, current state, and updates building
 * details accordingly.
 *
 * @param {Object} gameplay - The gameplay object that contains information about the current game session.
 * @param {Object} property - The property object representing the property where a building should be constructed.
 * @param {Object} team - The team object representing the team attempting to build on the property.
 * @param {Function} [callback] - An optional callback function for handling errors. The method no longer supports
 *   callbacks and will return an error if one is provided.
 * @return {Promise<Object>} Returns a promise resolving to an object indicating the result of the operation. Contains
 *   success status, resulting amount, number of buildings, and property details. It includes an error message in case
 *   the operation fails.
 */
async function buyBuilding(gameplay, property, team, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in buyBuilding');
    return callback(new Error('no callback'));
  }
  if (property.gamedata.owner !== team.uuid) {
    logger.info(`${gameplay.internal.gameId} : wrong owner or building`, {
      owner: property.gamedata.owner,
      team:  team.uuid
    });
    return {success: false, message: 'this is not the owner'};
  }
  if (property.gamedata.buildings >= 5) {
    // there is nothing to do, already a hotel
    logger.debug(`${gameplay.internal.gameId} : there is already a hotel in ${property.location.name}`);
    return {success: false, message: 'can not build, already a hotel there'};
  }
  if (!property.gamedata.buildingEnabled) {
    logger.debug(`${gameplay.internal.gameId} : can not build now, wait for next round for ${property.location.name}`);
    return {success: false, message: 'can not build now, wait for next round'};
  }
  property.gamedata.buildings++;
  property.gamedata.buildingEnabled = false;

  await propWrap.updateProperty(property)

  let retVal = {
    success:      true,
    amount:       Math.abs(getBuildingPrice(property)) * (-1),
    buildingNb:   property.gamedata.buildings,
    property:     property.uuid,
    propertyName: property.location.name
  };

  // Save a property transaction
  let pt           = new propertyTransaction.Model();
  pt.gameId        = gameplay.internal.gameId;
  pt.propertyId    = property.uuid;
  pt.sponsorTeamId = team.uuid;
  pt.amount        = retVal.amount;
  pt.info          = 'Hausbau';
  pt.transaction   = {
    origin: {
      uuid: team.uuid,
      type: 'team'
    },
    amount: retVal.amount, // building buildings is negative earning on the property
    info:   'Hausbau'
  };

  await propertyTransaction.book(pt)
  if (ferroSocket) {
    ferroSocket.emitToAdmins(gameplay.internal.gameId, 'admin-propertyAccount', {
      cmd:         'buildingBuilt',
      property:    property,
      transaction: pt
    });

    ferroSocket.emitToTeam(gameplay.internal.gameId, team.uuid, 'team-property-update', property);
  }
  return retVal;
}

/**
 * Pays the interest (normally every hour) for properties: their value. This function
 * just books it in the property account. The register is the one retrieved using
 * getRentRegister
 * @param gameplay
 * @param registers
 * @param teamId
 */
async function payInterest(gameplay, registers, teamId = null) {

  if (registers.length === 0) {
    // nothing to pay
    logger.debug(`${_.get(gameplay, 'internal.gameId')}: nothing to pay`, {gameId: _.get(gameplay, 'internal.gameId')});
    return null;
  }

  let retVal = {bookings: 0};

  for (let entry of registers) {
    logger.debug(`${_.get(gameplay, 'internal.gameId')}: Book propertyAccount transaction for "${entry.propertyName}"`);
    let pt             = new propertyTransaction.Model();
    pt.gameId          = gameplay.internal.gameId;
    pt.propertyId      = entry.uuid;
    pt.receivingTeamId = teamId;
    pt.amount          = Math.abs(entry.amount); // interest is positive earning on the property
    pt.info            = 'Zinsen ' + entry.propertyName;
    pt.transaction     = {
      origin: {
        type: 'bank'
      },
      amount: Math.abs(entry.amount), // interest is positive earning on the property
      info:   'Zinsen ' + entry.propertyName
    };

    retVal.bookings++;
    await propertyTransaction.book(pt)
  }

  return retVal;
}

/**
 * Get the rent register: nothing is booked, but the rent of all properties of a team
 * is evaluated
 * @param gameplay
 * @param team
 * @param callback
 */
async function getRentRegister(gameplay, team, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getRentRegister');
    return callback(new Error('no callback'));
  }
  const properties = await propWrap.getTeamProperties(gameplay.internal.gameId, team.uuid)

  let info = {
    register:    [],
    totalAmount: 0,
    teamId:      team.uuid
  };

  for (let property of properties) {
    let propVal = await getPropertyValue(gameplay, property);
    info.register.push(propVal);
    info.totalAmount += propVal.amount;
  }

  return info;
}

/**
 * Gets the account statement for all properties belonging to a team, all bookings up to a given time
 *
 * Param order p-params: [start] [end] callback
 * If only one param (start|end) is supplied, it is handled as start
 *
 * @param gameId
 * @param propertyId , when undefined: all
 * @param tsStart
 * @param tsEnd
 */
async function getAccountStatement(gameId, propertyId, tsStart = undefined, tsEnd = undefined) {
  return await propertyTransaction.getEntries(gameId, propertyId, tsStart, tsEnd);
}

/**
 * Gets the balance of the property, at a given time or now
 * @param gameId
 * @param propertyId
 * @param p1 timestamp until when the balance shall be gotten (optional, default: now)
 * @param p2 callback
 */
async function getBalance(gameId, propertyId, p1, p2) {
  let callback = p2;
  let ts       = p1;
  if (_.isFunction(p1)) {
    callback = p1;
    ts       = DateTime.now().toJSDate();
  }

  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getBalance');
    return callback(new Error('no callback'));
  }

  if (!_.isString(gameId)) {
    throw new Error('gameId must be a string in getBalance');
  }
  if (!_.isString(propertyId)) {
    throw new Error('propertyId must be a string in getBalance');
  }

  const data = await propertyTransaction.getEntries(gameId, propertyId, undefined, ts);

  let saldo = 0;
  let i;
  for (i = 0; i < data.length; i++) {
    saldo += data[i].transaction.amount;
  }
  return {balance: saldo, entries: i};

}

/**
 * Returns the value of the property for rent and interest
 * @param gameplay
 * @param property
 * @param callback
 * @returns {*}
 */
async function getPropertyValue(gameplay, property, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getPropertyValue');
    return callback(new Error('no callback'));
  }
  const properties = await propWrap.getPropertiesOfGroup(property.gameId, property.pricelist.propertyGroup);
  let sameGroup    = 0;
  for (let i = 0; i < properties.length; i++) {
    if (properties[i].gamedata.owner === property.gamedata.owner) {
      sameGroup++;
    }
  }

  let retVal = {
    propertyName: property.location.name,
    property:     property.uuid
  };

  let factor = 1;
  if ((properties.length > 1) && (sameGroup === properties.length)) {
    // all properties in a group belong the same team, pay more!
    logger.info(`${_.get(gameplay, 'internal.gameId')}: Properties in same group, paying more!`);
    factor                      = gameplay.gameParams.rentFactors.allPropertiesOfGroup || 2;
    retVal.allPropertiesOfGroup = true;
  }

  let rent       = 0;
  let buildingNb = property.gamedata.buildings || 0;

  switch (buildingNb) {
    case 0:
      rent = property.pricelist.rents.noHouse;
      break;
    case 1:
      rent = property.pricelist.rents.oneHouse;
      break;
    case 2:
      rent = property.pricelist.rents.twoHouses;
      break;
    case 3:
      rent = property.pricelist.rents.threeHouses;
      break;
    case 4:
      rent = property.pricelist.rents.fourHouses;
      break;
    case 5:
      rent = property.pricelist.rents.hotel;
      break;
    default:
      throw new Error('invalid building nb');
  }

  retVal.amount = rent * factor;
  retVal.uuid   = property.uuid;
  return retVal;

}

/**
 * Get the price for a building
 * @param property
 * @returns {*}
 */
function getBuildingPrice(property) {
  return property.pricelist.pricePerHouse;
}

/**
 * Returns the profitability of all or a specific property
 * @param gameId
 * @param propertyId (can be undefined if all are requested)
 * @param callback
 */
async function getPropertyProfitability(gameId, propertyId = undefined, callback = null) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getPropertyProfitability');
    return callback(new Error('no callback'));
  }

  if (!_.isString(gameId)) {
    throw new Error('gameId must be a string in getPropertyProfitability');
  }
  if (!_.isString(propertyId) && !_.isUndefined(propertyId)) {
    throw new Error('propertyId must be a string OR undefined in getPropertyProfitability');
  }

  return await propertyTransaction.getSummary(gameId, propertyId);
}



module.exports = {
  getBuildingPrice:         getBuildingPrice,
  getPropertyValue:         getPropertyValue,
  getRentRegister:          getRentRegister,
  payInterest:              payInterest,
  buyProperty:              buyProperty,
  buyBuilding:              buyBuilding,
  getBalance:               getBalance,
  resetProperty:            resetProperty,
  getPropertyProfitability: getPropertyProfitability,
  getAccountStatement:      getAccountStatement,
  chargeRent:               chargeRent,

  init: function () {
    ferroSocket = require('../ferroSocket').get();
  }
};
