/**
 * The store for team accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {useTeamsStore} from './TeamsStore';

export const useTeamAccountStore = defineStore('TeamAccount', {
  state:   () => ({
    records:            new Map(),
    lastValidTimestamp: '2022-07-06T12:00',
    balances:           new Map() // Balances of the teams, teams.uuid is the key
  }),
  getters: {
    rankingList: (state) => {
      return [...state.balances.values()].sort((a, b) => b.balance - a.balance);
    }
  },
  actions: {
    async loadTeamAccountEntries(gameId, teamId = 'all') {
      const self = this;
      try {
        let start         = this.lastValidTimestamp;
        const resp        = await axios.get(`/teamAccount/get/${gameId}/${teamId}/${start}`);
        const accountData = resp.data.accountData;
        console.log('accountData', accountData);
        if (!accountData || accountData.length === 0) {
          console.warn('No account data (which is strange');
          return;
        }
        for (const entry of accountData) {
          self.records.set(entry._id, entry);
        }
        this.lastValidTimestamp = accountData[accountData.length - 1].timestamp;

        // Update balances for all teams
        // Optimization: Find the latest entry per team in one pass O(N) 
        // instead of sorting the whole array O(N log N).
        const latestEntriesByTeam = new Map();

        for (const record of this.records.values()) {
          const currentBest = latestEntriesByTeam.get(record.teamId);
          // ISO timestamps can be compared directly as strings, which is much faster than localeCompare
          if (!currentBest || record.timestamp > currentBest.timestamp) {
            latestEntriesByTeam.set(record.teamId, record);
          }
        }

        const teamsStore = useTeamsStore();
        for (const team of teamsStore.teams) {
          const lastTeamEntry = latestEntriesByTeam.get(team.uuid);
          
          if (lastTeamEntry) {
            self.balances.set(team.uuid, {teamId: team.uuid, balance: lastTeamEntry.balance, teamName: team.name});
          }
          else {
            self.balances.set(team.uuid, {teamId: team.uuid, balance: 0, teamName: team.name});
          }
        }
      }
      catch (err) {
        console.error(err);
      }
    }
  }
})
