/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 12.12.2025
 **/

import {defineStore} from 'pinia'
import {DateTime} from 'luxon';
import axios from 'axios';
import {useTeamsStore} from './TeamsStore';


export const useChancelleryStore = defineStore('Chancellery', {
  state:   () => ({
    records: new Map(),
    balance: 0 // aka Parkplatz
  }),
  getters: {},
  actions: {
    async loadChancelleryEntries(gameId) {
      const teamsStore = useTeamsStore();
      const self       = this;
      try {
        const resp    = await axios.get(`/chancellery/account/statement/${gameId}`);
        const entries = resp.data.entries;
        console.log('chancellery', entries);

        let balance = 0;
        for (const entry of entries) {
          entry.timestamp        = DateTime.fromISO(entry.timestamp).toJSDate();
          balance += entry.transaction.amount;
          entry.balance          = balance;
          entry.transaction.team = teamsStore.idToTeamName(entry.transaction.origin.uuid);
          self.records.set(entry._id, entry);
        }
        self.balance = balance;
        console.log('done')
      }
      catch (err) {
        console.error(err);
      }
    }
  }
})
