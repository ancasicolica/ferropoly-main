/**
 * The store for team accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';

export const useTeamAccountStore = defineStore('TeamAccount', {
  state:   () => ({
    records: new Map(),
    lastValidTimestamp: '2022-07-06T12:00'
  }),
  getters: {

  },
  actions: {
    async loadTeamAccountEntries(gameId, teamId = 'all') {
      const self = this;
      try {
        let query  = '?start=' + this.lastValidTimestamp;
        const resp = await axios.get(`/teamAccount/get/${gameId}/${teamId}${query}`);
        const accountData = resp.data.accountData;
        console.log('accountData', accountData);
        for(const entry of accountData) {
          self.records.set(entry._id, entry);
        }
      }
      catch (err) {
        console.error(err);
      }
    }
  }
})
