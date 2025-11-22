/**
 * Account statement function
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 18.04.22
 **/

const teamAccount = require('./teamAccount');
const _           = require('lodash');
const {DateTime} = require('luxon');

/**
 * Collects the account statement used for the frontend, a generic function used in different locations with different
 * access rights
 * @param gameId
 * @param teamId
 * @param start is an ISO String
 * @param end is an ISO String
 */
module.exports = async function (gameId, teamId = undefined, start = undefined, end = undefined) {

  let teamBalance = {};
  let tsStart     = start ?  DateTime.fromISO(start).toJSDate() : DateTime.fromISO('2020-01-01T00:00:00Z').toJSDate();
  let tsEnd       = end ?  DateTime.fromISO(end).toJSDate() : DateTime.fromISO('2525-01-01T00:00:00Z').toJSDate();

  const data = await teamAccount.getAccountStatement(gameId, teamId, tsStart, tsEnd);

  for (let i = 0; i < data.length; i++) {
    if (_.isUndefined(teamBalance[data[i].teamId])) {
      // If we don't have the team balance, get it at the starting point (including the starting point)
      const balanceAtStart = await teamAccount.getBalance(gameId, data[i].teamId, tsStart);
      teamBalance[data[i].teamId] = balanceAtStart.asset;
    }
    teamBalance[data[i].teamId] += data[i].transaction.amount;
    data[i].balance = teamBalance[data[i].teamId];

    //  data[i].transaction = _.omit(data[i].transaction, 'origin');
    data[i] = _.omit(data[i], ['gameId', '__v']);
  }

  return {accountData: data, teamBalance};
}
