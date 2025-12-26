/**
 * The store for team accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {useTeamsStore} from './TeamsStore';
import {DateTime} from 'luxon';
import {
  TEAM_TRANSACTION_CHANCELLERY,
  TEAM_TRANSACTION_GAMBLING, TEAM_TRANSACTION_HOURLY_FEE, TEAM_TRANSACTION_INTEREST,
  TEAM_TRANSACTION_PENALTY_RATE,
  TEAM_TRANSACTION_PURCHASE_HOUSE, TEAM_TRANSACTION_PURCHASE_PROPERTY, TEAM_TRANSACTION_RENT, TEAM_TRANSACTION_START_FEE
} from '../../../common/models/accounting/teamAccountTransactionTypes';

let teamsStore = null;

export const useTeamAccountStore = defineStore('TeamAccount', {
  state:   () => ({
    records:            new Map(),
    lastValidTimestamp: DateTime.fromISO('2022-07-06T12:00'),
    balances:           new Map() // Balances of the teams, teams.uuid is the key
  }),
  getters: {
    rankingList:    (state) => {
      return [...state.balances.values()].sort((a, b) => b.balance - a.balance);
    },
    accountForTeam: (state) => (teamId) => {
      return state.records.get(teamId);
    },

    /**
     * Computes and returns a summary of financial transactions for a specific team based on the state.
     * The summary includes categorized totals of different transaction types, such as gambling, chancellery,
     * penalties, property purchases, house purchases, rent, hourly fees, and interest. Transactions that do not
     * fall into any predefined categories are grouped under "various".
     *
     * @param {Object} state - The state object containing financial transaction records.
     * @returns {Function} A function that takes a team ID and returns the categorized summary of transactions
     *                     for the specified team, or `null` if no records exist for the team.
     *
     * The returned summary object includes the following categories:
     * - `various`: Total amount for uncategorized transactions.
     * - `gambling`: Total amount for gambling-related transactions.
     * - `chancellery`: Total amount for chancellery-related transactions.
     * - `penalty`: Total amount for penalty-related transactions.
     * - `propertyPurchase`: Total amount for property purchase transactions.
     * - `housePurchase`: Total amount for house purchase transactions.
     * - `rent`: Total amount for rent-related transactions.
     * - `hourlyFee`: Total amount for hourly or start fee-related transactions.
     * - `interest`: Total amount for interest-related transactions.
     *
     */
    accountSummaryForTeam: (state) => (teamId) => {
      const records = state.records.get(teamId);
      const retVal  = {
        various:          0,
        gambling:         0,
        chancellery:      0,
        penalty:          0,
        propertyPurchase: 0,
        housePurchase:    0,
        rent:             0,
        hourlyFee:        0,
        interest:         0
      }
      if (!records) {
        return retVal;
      }
      for (const r of records) {
        switch (r.transaction.type) {
          case TEAM_TRANSACTION_GAMBLING:
            retVal.gambling += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_HOURLY_FEE:
          case TEAM_TRANSACTION_START_FEE:
            retVal.hourlyFee += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_CHANCELLERY:
            retVal.chancellery += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_PENALTY_RATE:
            retVal.penalty += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_PURCHASE_PROPERTY:
            retVal.propertyPurchase += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_PURCHASE_HOUSE:
            retVal.housePurchase += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_RENT:
            retVal.rent += r.transaction.amount;
            break;
          case TEAM_TRANSACTION_INTEREST:
            retVal.interest += r.transaction.amount;
            break;
          default:
            console.warn('Transaction category "various"', r);
            retVal.various += r.transaction.amount;
            break;
        }
      }

      let check = retVal.various + retVal.gambling + retVal.chancellery + retVal.penalty + retVal.propertyPurchase + retVal.housePurchase + retVal.rent + retVal.hourlyFee + retVal.interest;
      console.log('Check account', check, retVal);
      return retVal;
    }
  },
  actions: {
    async loadTeamAccountEntries(gameId, teamId = 'all') {
      const self = this;
      try {
        console.log('TeamAccountStore.loadTeamAccountEntries start');
        if (!teamsStore) {
          teamsStore = useTeamsStore();
        }
        let start         = this.lastValidTimestamp.toISO();
        const resp        = await axios.get(`/teamAccount/get/${gameId}/${teamId}/${start}`);
        const accountData = resp.data.accountData;

        if (!accountData || accountData.length === 0) {
          return;
        }

        console.log(`TeamAccountStore.loadTeamAccountEntries stage 2. Nb entries: ${accountData.length}`);
        const affectedTeamIds = new Set(); // Verfolgen, welche Teams Updates erhielten

        for (const entry of accountData) {
          const dt = DateTime.fromISO(entry.timestamp);
          if (!dt.isValid) {
            console.warn('loadTeamAccountEntries: invalid timestamp', entry)
            continue;
          }

          entry.timestamp = dt;
          let account     = this.records.get(entry.teamId);
          if (!account) {
            account = [];
            this.records.set(entry.teamId, account);
          }

          // Schnellerer Check (idealerweise über eine Map/Set der IDs pro Team)
          if (!account.some(e => e._id === entry._id)) {
            account.push(entry);
            affectedTeamIds.add(entry.teamId);
          }

          if (this.lastValidTimestamp < entry.timestamp) {
            this.lastValidTimestamp = entry.timestamp;
          }
        }

        console.log('TeamAccountStore.loadTeamAccountEntries stage 3');
        // Nur betroffene Bilanzen aktualisieren
        affectedTeamIds.forEach(tId => {
          const teamAccount = this.records.get(tId);
          teamAccount.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

          const balance = teamAccount.reduce((sum, e) => sum + e.transaction.amount, 0);

          this.balances.set(tId, {
            teamId:   tId,
            balance:  Math.round(balance * 100) / 100, // Einfacher Fix für Rundungsfehler
            teamName: teamsStore.idToTeamName(tId)
          });
        });
        console.log('TeamAccountStore.loadTeamAccountEntries finished');
      }
      catch (err) {
        console.log(self, self.lastValidTimestamp);
        console.error(err);
      }
    }
  }
})
