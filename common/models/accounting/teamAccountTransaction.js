/**
 * A transaction of a teams account
 *
 * Created by kc on 19.04.15.
 */
'use strict';

var mongoose = require('mongoose');
var moment = require('moment');
var logger = require('../../lib/logger').getLogger('teamAccountTransaction');
var _ = require('lodash');
/**
 * The mongoose schema for a team account
 */
var teamAccountTransactionSchema = mongoose.Schema({
  gameId: String, // Game the transaction belongs to
  timestamp: {type: Date, default: Date.now}, // Timestamp of the transaction
  teamId: String, // This is the uuid of the team the account belongs to

  transaction: {
    /*
     The origin is the counterpart, not the one giving money. The flow of the money is defined
     by the amount, which is either positive or negative.
     */
    origin: {
      uuid: {type: String, default: 'fff'}, // uuid of the origin, can be a property or a team
      category: {type: String, default: 'undefined'}  // either "team", "property", "bank", "chancellery"
    },
    amount: {type: Number, default: 0}, // value to be transferred, positive or negative
    info: String, // Info about the transaction
    /*
     If the transaction consists of several other transactions (interests every hour), we do not create
     a specific TeamAccountTransaction for every property. Instead there is an array having the same
     data as this transaction (except this array)
     */
    parts: Array
  }

}, {autoIndex: true});

/**
 * The Gameplay model
 */
var TeamAccountTransaction = mongoose.model('TeamAccountTransactions', teamAccountTransactionSchema);

/**
 * Book the transaction
 * @param transaction
 * @param callback
 */
function book(transaction, callback) {
  if (transaction.transaction.parts) {
    transaction.transaction.parts = _.sortBy(transaction.transaction.parts, 'propertyName');
  }
  transaction.save(function (err) {
    callback(err);
  });
}

/**
 * Book two transactions: the debitor and creditor bookings
 * @param debitor
 * @param creditor
 * @param callback
 */
function bookTransfer(debitor, creditor, callback) {
  debitor.save(function (err) {
    if (err) {
      callback(err);
    }
    creditor.save(function (err) {
      callback(err);
    });
  });
}

/***
 * Get the entries of the account
 * @param gameId
 * @param teamId, if undefined, then all entries of all teams are returned
 * @param tsStart moment() to start, if undefined all. NOT INCLUDING the entry with exactly this timestamp.
 * @param tsEnd   moment() to end, if undefined now()
 * @param callback
 * @returns {*}
 */
function getEntries(gameId, teamId, tsStart, tsEnd, callback) {
  if (!gameId) {
    return callback(new Error('parameter error, missing gameId'));
  }

  if (!tsStart) {
    tsStart = moment('2015-01-01');
  }
  if (!tsEnd) {
    tsEnd = moment();
  }
  if (teamId) {
    // Only of one team
    TeamAccountTransaction.find({gameId: gameId})
      .where('teamId').equals(teamId)
      .where('timestamp').gt(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(function (err, data) {
        callback(err, data);
      })
  }
  else {
    // all teams
    TeamAccountTransaction.find({gameId: gameId})
      .where('timestamp').gt(tsStart.toDate()).lte(tsEnd.toDate())
      .sort('timestamp')
      .lean()
      .exec(function (err, data) {
        callback(err, data);
      })
  }
}

/**
 * Dumps all data for a gameplay (when deleting the game data)
 * @param gameId
 * @param callback
 */
function dumpAccounts(gameId, callback) {
  if (!gameId) {
    return callback(new Error('No gameId supplied'));
  }
  logger.info('Removing all account information for ' + gameId);
  TeamAccountTransaction.remove({gameId: gameId}, function (err) {
    callback(err);
  })
}

module.exports = {
  Model: TeamAccountTransaction,
  book: book,
  bookTransfer: bookTransfer,
  getEntries: getEntries,
  dumpAccounts: dumpAccounts
};
