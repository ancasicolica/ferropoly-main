/**
 * This is the account of a TEAM: every transaction, positive or negative, is done
 * over this module.
 * Created by kc on 19.04.15.
 */

const _                      = require('lodash');
const teamAccountTransaction = require('./../../../common/models/accounting/teamAccountTransaction');
const logger                 = require('../../../common/lib/logger').getLogger('accounting:teamAccount');
const teamAccountActions     = require('../../../components/checkin-datastore/lib/teamAccount/actions');
const {DateTime} = require('luxon');

let ferroSocket;

/**
 * Pays the interest for one team
 * @param teamId
 * @param gameId
 * @param amount
 * @param callback
 */
async function payInterest(teamId, gameId, amount, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in payInterest');
    return callback(new Error('no callback'));
  }
  if (!_.isString(teamId) || !_.isString(gameId) || !_.isNumber(amount)) {
    logger.info('Bullshit params in payInterest', {teamId, gameId, amount});
    throw new Error('Parameter error in payInterest');
  }

  let entry                = new teamAccountTransaction.Model();
  entry.gameId             = gameId;
  entry.teamId             = teamId;
  entry.transaction.amount = amount;
  entry.transaction.origin = {category: 'bank'};
  entry.transaction.info   = 'Startgeld';
  await teamAccountTransaction.book(entry);
  if (ferroSocket) {
    ferroSocket.emitToAdmins(gameId, 'admin-teamAccount', {cmd: 'onTransaction', data: entry});
    ferroSocket.emitToTeam(gameId, teamId, 'checkinStore', teamAccountActions.addTransaction(entry));
  }
}

/**
 * Internal function, charging to bank or chancellery
 * @param options with at least:
 *  - teamId
 *  - gameId
 *  - amount   amount to pay (will be always turned to a negative value)
 *  - info     optional text to be supplied with the transaction or object
 *  - user     optional: user which initiated transaction
 *  - category
 * @param callback
 * @returns {*}
 */
async function chargeToBankOrChancellery(options, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in chargeToBankOrChancellery');
    return callback(new Error('no callback'));
  }
  if (!options.teamId || !options.gameId || !_.isNumber(options.amount)) {
    throw new Error('Parameter error in chargeToBank');
  }

  if (options.amount === 0) {
    throw new Error('Value must not be 0');
  }

  // Amount has to be negative, not concerning of the parameter value!
  const chargedAmount = (-1) * Math.abs(options.amount);

  let entry                = new teamAccountTransaction.Model();
  entry.gameId             = options.gameId;
  entry.teamId             = options.teamId;
  entry.transaction.amount = chargedAmount;
  entry.transaction.origin = {category: options.category};
  entry.user               = options.user;
  if (_.isString(options.info)) {
    entry.transaction.info = options.info;
  } else if (_.isObject(options.info)) {
    entry.transaction.info  = options.info.info;
    entry.transaction.parts = options.info.parts;
  }

  await teamAccountTransaction.book(entry);
  if (ferroSocket) {
    ferroSocket.emitToAdmins(options.gameId, 'admin-teamAccount', {cmd: 'onTransaction', data: entry});
    ferroSocket.emitToTeam(options.gameId, options.teamId, 'checkinStore', teamAccountActions.addTransaction(entry));
  }
  return {amount: chargedAmount};

}

/**
 * Charging a teams account to the bank
 * @param options with at least:
 *  - teamId
 *  - gameId
 *  - amount   amount to pay (will be always turned to a negative value)
 *  - info     optional text to be supplied with the transaction or object
 * @param callback
 */
async function chargeToBank(options, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in chargeToBank');
    return callback(new Error('no callback'));
  }
  options.category = 'bank';
  return await chargeToBankOrChancellery(options);
}

/**
 * Charging a teams account to the chancellery
 * @param options with at least:
 *  - teamId
 *  - gameId
 *  - amount   amount to pay (will be always turned to a negative value)
 *  - info     optional text to be supplied with the transaction or object
 * @param callback
 */
async function chargeToChancellery(options, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in chargeToChancellery');
    return callback(new Error('no callback'));
  }
  options.category = 'chancellery';
  return await chargeToBankOrChancellery(options);
}

/**
 * Internal function for receiving money from bank or chancellery
 * @param teamId
 * @param gameId
 * @param amount
 * @param info
 * @param category
 * @param callback
 * @returns {*}
 */
async function receiveFromBankOrChancellery(teamId, gameId, amount, info, category, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in receiveFromBankOrChancellery');
    return callback(new Error('no callback'));
  }

  if (!_.isString(teamId) || !_.isString(gameId) || !_.isNumber(amount)) {
    logger.info('Bullshit params in receiveFromBankOrChancellery', {teamId: teamId, gameId: gameId, amount: amount});
    throw new Error('Parameter error in receiveFromBankOrChancellery');
  }

  if (amount === 0) {
    throw new Error('Value must not be 0');
  }

  let entry                = new teamAccountTransaction.Model();
  entry.gameId             = gameId;
  entry.teamId             = teamId;
  entry.transaction.amount = Math.abs(amount);
  entry.transaction.origin = {category: category};
  if (_.isString(info)) {
    entry.transaction.info = info;
  } else if (_.isObject(info)) {
    entry.transaction.info  = info.info;
    entry.transaction.parts = info.parts;
  }

  await teamAccountTransaction.book(entry)
  if (ferroSocket) {
    ferroSocket.emitToAdmins(gameId, 'admin-teamAccount', {cmd: 'onTransaction', data: entry});
    ferroSocket.emitToTeam(gameId, teamId, 'checkinStore', teamAccountActions.addTransaction(entry));
  }
  return {amount }
}

/**
 * Get money for a teams account from the bank
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a positive value)
 * @param info     optional text to be supplied with the transaction or object
 * @param callback
 */
async function receiveFromBank(teamId, gameId, amount, info, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in receiveFromBank');
    return callback(new Error('no callback'));
  }
  return await receiveFromBankOrChancellery(teamId, gameId, amount, info, 'bank');
}

/**
 * Get money for a teams account from the chancellery
 * @param teamId
 * @param gameId
 * @param amount   amount to pay (will be always turned to a positive value)
 * @param info     optional text to be supplied with the transaction or object
 * @param callback
 */
async function receiveFromChancellery(teamId, gameId, amount, info, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in receiveFromChancellery');
    return callback(new Error('no callback'));
  }
  return await receiveFromBankOrChancellery(teamId, gameId, amount, info, 'chancellery');
}

/**
 * One team pays another one
 * @param options
 * @param callback
 */
async function chargeToAnotherTeam(options, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in chargeToAnotherTeam');
    return callback(new Error('no callback'));
  }
  if (!_.isString(options.debitorTeamId) || !_.isString(options.creditorTeamId) || !_.isString(options.info) || !_.isString(options.gameId) || !_.isNumber(options.amount)) {
    logger.info('Bullshit params in chargeToAnotherTeam', options);
    throw new Error('Parameter error in chargeToAnotherTeam');
  }

  if (options.amount === 0) {
    // not considered as error anymore, just no bookings done!
    return {amount: 0};
  }

  // Amount has to be positive for us, not concerning of the parameter value!
  const chargedAmount = Math.abs(options.amount);

  let chargingEntry                = new teamAccountTransaction.Model();
  chargingEntry.gameId             = options.gameId;
  chargingEntry.teamId             = options.debitorTeamId;
  chargingEntry.user               = options.user;
  chargingEntry.transaction.amount = chargedAmount * (-1);
  chargingEntry.transaction.origin = {
    uuid:     options.creditorTeamId,
    category: 'team'
  };
  chargingEntry.transaction.info   = options.info;

  let receivingEntry                = new teamAccountTransaction.Model();
  receivingEntry.gameId             = options.gameId;
  receivingEntry.teamId             = options.creditorTeamId;
  receivingEntry.user               = options.user;
  receivingEntry.transaction.amount = chargedAmount;
  receivingEntry.transaction.origin = {uuid: options.debitorTeamId, category: 'team'};
  receivingEntry.transaction.info   = options.info;

  await teamAccountTransaction.bookTransfer(chargingEntry, receivingEntry)
  if (ferroSocket) {
    ferroSocket.emitToAdmins(options.gameId, 'admin-teamAccount', {cmd: 'onTransaction', data: chargingEntry});
    ferroSocket.emitToAdmins(options.gameId, 'admin-teamAccount', {cmd: 'onTransaction', data: receivingEntry});
    ferroSocket.emitToTeam(options.gameId, chargingEntry.teamId, 'checkinStore', teamAccountActions.addTransaction(chargingEntry));
    ferroSocket.emitToTeam(options.gameId, receivingEntry.teamId, 'checkinStore', teamAccountActions.addTransaction(receivingEntry));
  }
  return {amount: options.amount};
}

/**
 * Gets the balance, at a given time or now
 * @param gameId
 * @param teamId
 * @param atTime
 */
async function getBalance(gameId, teamId, atTime='2525-01-01T00:00:00Z') {

  if (typeof (gameId) !== 'string') {
    throw new Error('gameId must be a string');
  }
  if (typeof (teamId) !== 'string') {
    throw new Error('teamId must be a string');
  }

  const value = await teamAccountTransaction.getBalance(gameId, teamId, atTime);
  return {asset: value.asset, count: value.count};
}

/**
 * Handles a negative balance at the end of a round: pay an interest.
 * @param gameId
 * @param teamId
 * @param rate  rate of interest, a percentage between 0 and 100
 * @param callback
 */
async function negativeBalanceHandling(gameId, teamId, rate, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in negativeBalanceHandling');
    return callback(new Error('no callback'));
  }
  const info = await getBalance(gameId, teamId);

  if (info.asset < 0) {
    let interest = Math.floor(Math.abs(info.asset * rate / 100));
    logger.info(`${gameId}: Negative balance, pay interest ${interest} from ${info.asset}`, {gameId, teamId});
    // Do not book here! The teamAccount does not have a connection to the chancellery; it's the
    // chancellerys job to book, we just make the calculation here.
    return {amount: interest};
  }
  return {amount: 0};
}

/**
 * Returns the ranking list for a gameplay
 * @param gameId
 * @param callback
 */
async function getRankingList(gameId, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getRankingList');
    return callback(new Error('no callback'));
  }
  const data = await teamAccountTransaction.getRankingList(gameId);

  let sorted = _.sortBy(_.values(data), function (n) {
    return n.asset * (-1);
  });
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].teamId = sorted[i]._id;
    if (sorted[i - 1] && (sorted[i - 1].asset === sorted[i].asset)) {
      // Same asset, same rank
      sorted[i].rank = sorted[i - 1].rank;
    } else {
      sorted[i].rank = i + 1;
    }
  }
  return sorted;
}

/**
 * Gets the account statement, all bookings up to a given time
 *
 * Param order p-params: [start] [end] callback
 * If only one param (start|end) is supplied, it is handled as start
 *
 * @param gameId
 * @param teamId
 * @param p1  Timestamp for start (optional)
 * @param p2  Timestamp for end (optional)
 * @param p3  Callback
 */
async function getAccountStatement(gameId, teamId, p1, p2, p3) {

  let tsStart  = p1;
  let tsEnd    = p2;
  let callback = p3;
  if (_.isFunction(p1)) {
    callback = p1;
    tsStart  = undefined;
    tsEnd    = DateTime.now().toJSDate();
  } else if (_.isFunction(p2)) {
    callback = p2;
    tsStart  = p2;
    tsEnd    = DateTime.now().toJSDate();
  }
  if (!tsEnd) {
    tsEnd = DateTime.now().toJSDate();
  }

  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getAccountStatement');
    return callback(new Error('no callback'));
  }

  if(!_.isString(gameId)) {
    throw new Error('gameId must be a String');
  }

  return await teamAccountTransaction.getEntries(gameId, teamId, tsStart, tsEnd);
}


module.exports = {
  payInterest:             payInterest,
  chargeToBank:            chargeToBank,
  chargeToChancellery:     chargeToChancellery,
  receiveFromBank:         receiveFromBank,
  receiveFromChancellery:  receiveFromChancellery,
  chargeToAnotherTeam:     chargeToAnotherTeam,
  getBalance:              getBalance,
  negativeBalanceHandling: negativeBalanceHandling,
  getAccountStatement:     getAccountStatement,
  getRankingList:          getRankingList,

  init: function () {
    ferroSocket = require('../ferroSocket').get();

    if (!ferroSocket) {
      return;
    }
    ferroSocket.on('player-connected', function (data) {
      getBalance(data.gameId, data.teamId, function (err, info) {
        if (err) {
          logger.error(`${data.gameId}: error in init`, err);
          return;
        }
        ferroSocket.emitToTeam(data.gameId, data.teamId, 'checkinStore', teamAccountActions.setAsset(info.asset, info.count));

        getAccountStatement(data.gameId, data.teamId, function (err, transactions) {
          ferroSocket.emitToTeam(data.gameId, data.teamId, 'checkinStore', teamAccountActions.setTransactions(transactions));
          logger.debug(`${data.gameId}: TeamAccount Socket connected`, {
            info,
            gameId: data.gameId,
            teamId: data.teamId
          });
        });
      });
    });
  }
};
