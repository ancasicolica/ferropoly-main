/**
 * The store for team accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {useTeamsStore} from './TeamsStore';
import {DateTime} from 'luxon';

export const useTeamAccountStore = defineStore('TeamAccount', {
  state:   () => ({
    records:            new Map(),
    lastValidTimestamp: DateTime.fromISO('2022-07-06T12:00'),
    balances:           new Map() // Balances of the teams, teams.uuid is the key
  }),
  getters: {
    rankingList: (state) => {
      return [...state.balances.values()].sort((a, b) => b.balance - a.balance);
    },
    accountForTeam: (state) => (teamId) => {
      return state.records.get(teamId);
    }
  },
  actions: {
    async loadTeamAccountEntries(gameId, teamId = 'all') {
      const self = this;
      try {
        let start         = this.lastValidTimestamp.toISO();
        const resp        = await axios.get(`/teamAccount/get/${gameId}/${teamId}/${start}`);
        const accountData = resp.data.accountData;

        if (!accountData || accountData.length === 0) {
          console.warn(`No account data (which is strange). Start was ${start}`, resp.data);
          return;
        }
        console.log('accountData', accountData);

        for (const entry of accountData) {
          entry.timestamp = DateTime.fromISO(entry.timestamp);

          let account = self.records.get(entry.teamId);
          if (!account) {
            account = []
            self.records.set(entry.teamId, account);
          }
          if (!account.findLast(e => e._id === entry._id)) {
            account.push(entry);
          }

          if (this.lastValidTimestamp < entry.timestamp) {
            this.lastValidTimestamp = entry.timestamp;
          }
        }

        // Update balances for all teams
        const teamIds = self.records.keys();

        for (const teamId of teamIds) {
          const teamAccount = self.records.get(teamId);
          teamAccount.sort((a, b) => a.timestamp - b.timestamp);
          let balance = 0;
          for (const entry of teamAccount) {
            balance += entry.transaction.amount;
          }
          self.balances.set(teamId, {teamId: teamId, balance: balance, teamName: useTeamsStore().idToTeamName(teamId)});
        }

      }
      catch (err) {
        console.log(self, self.lastValidTimestamp);
        console.error(err);
      }
    }
  }
})
