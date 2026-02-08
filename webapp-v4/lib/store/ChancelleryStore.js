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
    /**
     * Loads the chancellery entries during the game
     * @param gameId
     * @return {Promise<void>}
     */
    async loadChancelleryEntries(gameId) {
      try {
        const resp    = await axios.get(`/chancellery/account/statement/${gameId}`);
        this.setEntries(resp.data.entries);
      }
      catch (err) {
        console.error(err);
      }
    },
    /**
     * Sets the entries (which were previously loaded)
     * @param entries
     */
    setEntries(entries) {
      try {
        console.log('chancellery transactions', entries);
        const teamsStore = useTeamsStore();
        let balance = 0;
        for (const entry of entries) {
          entry.timestamp        = DateTime.fromISO(entry.timestamp).toJSDate();
          balance += entry.transaction.amount;
          entry.balance          = balance;
          entry.transaction.team = teamsStore.idToTeamName(entry.transaction.origin.uuid);
          this.records.set(entry._id, entry);
        }
        this.balance = balance;
        console.log('done')
      }
      catch(err) {
        console.error(err);
      }
    },
    /**
     * Sets the balance to a value, only needed for check-in, where not all account data is available
     * @param balance
     */
    setBalance(balance) {
      this.balance= balance;
    }
  }
})
