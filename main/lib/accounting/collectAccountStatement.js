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
 * @param req
 */
module.exports = async function (req) {

  let teamBalance = {};
  let query       = req.query || {};
  let tsStart     = query.start ?  DateTime.fromISO(query.start) : undefined;
  let tsEnd       = query.end ?  DateTime.fromISO(query.end) : undefined;

  data = await teamAccount.getAccountStatement(req.params.gameId, req.params.teamId, tsStart, tsEnd);

  for (let i = 0; i < data.length; i++) {

    if (!(tsStart || tsEnd)) {
      // The balance is only available if ALL data is requested. Otherwise it does not make sense!
      if (_.isUndefined(teamBalance[data[i].teamId])) {
        teamBalance[data[i].teamId] = 0;
      }
      teamBalance[data[i].teamId] += data[i].transaction.amount;
      data[i].balance = teamBalance[data[i].teamId];
    }

    //  data[i].transaction = _.omit(data[i].transaction, 'origin');
    data[i] = _.omit(data[i], ['gameId', '__v']);
  }
  return {accountData: data};

}
