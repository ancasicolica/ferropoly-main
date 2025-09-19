/**
 * Team Account reporting
 * Created by kc on 17.07.15.
 */

const teamAccount = require('../../lib/accounting/teamAccount');
const teamModel   = require('../../../common/models/teamModel');
const xlsx        = require('node-xlsx');
const logger      = require('../../../common/lib/logger').getLogger('teamAccountReport');
const {DateTime}  = require('luxon');

module.exports = {
  /**
   * Returns the team account report for a given team (or for all teams, if teamId is not defined)
   * @param gameId
   * @param teamId
   * @param teams is a Map of all teams
   * @param callback
   */
  get: async function (gameId, teamId, teams, callback) {
    if (callback) {
      return new Error('no callbacks in teamAccountReport.get');
    }

    const data = await teamAccount.getAccountStatement(gameId, teamId);

    let title = ' alle Teams';
    if (teamId) {
      if (!teams.get(teamId)) {
        throw new Error(`Unknown teamId: ${teamId}`);
      }
      title = ' ' + teams.get(teamId).data.name;
    }

    let xlist = [['Kontobuch' + title], ['Zeit', 'Team', 'Buchungstext', 'Betrag', 'Saldo', 'Transaktionen']];

    // Reset balance of all teams first
    for (const team of teams.values()) {
      team.balance = 0;
    }

    // Format all data
    for (let bookingEntry of data) {
      let partText = '';
      if (bookingEntry.transaction.parts) {
        bookingEntry.transaction.parts.forEach(p => {
          partText += p.propertyName + ':' + p.amount + ' ';
        });
      }

      if (!teams.get(bookingEntry.teamId).balance) {
        const t = teams.get(bookingEntry.teamId);
        if (t) {
          t.balance = 0;
        }
      }
      teams.get(bookingEntry.teamId).balance += bookingEntry.transaction.amount;

      let entry = [DateTime.fromJSDate(bookingEntry.timestamp).toLocaleString(DateTime.TIME_WITH_SECONDS),
                   teams.get(bookingEntry.teamId)?.data.name,
                   bookingEntry.transaction.info,
                   bookingEntry.transaction.amount,
                   teams.get(bookingEntry.teamId)?.balance,
                   partText
      ];

      xlist.push(entry);
    }
    return xlist;
  },

  /**
   * Creates an excel sheet with all teams
   * @param gameId
   * @param callback
   */
  createXlsx: async function (gameId, callback) {
    if (callback) {
      return callback(new Error('no callbacks in teamAccountReport.createXlsx'));
    }

    try {
      const self   = this;
      const prefix = DateTime.now().toFormat('yyMMdd-HHmmss');
      const teams  = await teamModel.getTeamsAsMap(gameId);

      let teamArray = [undefined];
      for (const team of teams.values()) {
        teamArray.push(team);
      }

      let sheets = [];
      for (const team of teamArray) {
        const xlist = await self.get(gameId, team?.uuid, teams);
        if (!team) {
          sheets.push({name: 'Alle Teams', data: xlist});
        } else {
          sheets.push({name: teams.get(team.uuid)?.data.name.substring(0, 30), data: xlist});
        }
      }

      const xbuffer = xlsx.build(sheets);
      return {data: xbuffer, name: prefix + '-kontobuch.xlsx'};
    }
    catch (ex) {
      logger.info('Failed to create XLSX', ex.message)
      const xbuffer = xlsx.build([]);
      return {data: xbuffer, name: prefix + '-kontobuch.xlsx'};
    }


  }
};
