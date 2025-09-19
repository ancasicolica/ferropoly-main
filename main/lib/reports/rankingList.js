/**
 * Ranking list as downloadable file
 * Created by kc on 17.07.15.
 */

const teamAccount = require('../../lib/accounting/teamAccount');
const teamModel   = require('../../../common/models/teamModel');
const xlsx        = require('node-xlsx');
const _           = require('lodash');
const {DateTime}  = require('luxon');

module.exports = {
  /**
   * Returns the raw ranking list as array. The array is ready to be converted as a xlsx sheet
   * @param gameId
   * @param callback
   */
  get: async function (gameId, callback) {
    if (callback) {
      return callback(new Error('no callbacks in rankingList.get'));
    }
    try {
      const teams   = await teamModel.getTeamsAsMap(gameId);
      const ranking = await teamAccount.getRankingList(gameId);

      let xlist = [['Rangliste']];
      for (let i = 0; i < ranking.length; i++) {
        xlist.push([i + 1,
                    _.get(teams.get(ranking[i].teamId), 'data.name', 'Fehler: Kein Name!'),
                    _.get(ranking[i], 'asset', 0)]);
      }
      xlist.push(['Stand: ' + DateTime.now().toLocaleString(DateTime.DATETIME_MED)]);
      return xlist;
    }
    catch (ex) {
      return [['Fehler in Rangliste: ' + ex?.message || ex?.toString() || '']];
    }

  },
  /**
   * Create an Excel-File with the ranking list
   * @param gameId
   * @param callback
   */
  createXlsx: async function (gameId, callback) {
    if (callback) {
      return callback(new Error('no callbacks in rankingList.createXlsx'));
    }
    const xlist = await this.get(gameId);

    let xbuffer = xlsx.build([{name: 'Rangliste', data: xlist}]);
    let prefix  = DateTime.now().toFormat('yyMMdd-HHmmss');
    return {
      data: xbuffer,
      name: prefix + '-' + gameId + '-rangliste.xlsx'
    };
  }
};
