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
import {useGameplayStore} from './GameplayStore';

let teamsStore    = null;
let gameplayStore = null;

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
    bookingsNb: (state) => {
      let total = 0;
      for (const records of state.records.values()) {
        total += records.length;
      }
      return total;
    },
    /**
     * Retrieves the account information for a given team based on the team ID.
     *
     * @param {Object} state - The current state object containing team records.
     * @returns {Function} A function that accepts a team ID and returns the account information
     *                     associated with the given team ID from the state's records.
     *
     * @returns {*} The account information stored in the state's records for the given team ID.
     */
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
    },
    /**
     * Computes income summaries for a specific team over predefined periods (interest rounds).
     *
     * This function takes the `state` object and a `teamId`, identifying all transactions of the team and
     * categorizing them into different types. It summarizes the data for each period between consecutive
     * interest rounds, providing details on various income and expense categories.
     *
     * Each period summary includes the amount for each category, the total balance, and the start and
     * end timestamps of the period.
     *
     * @param {object} state - The state object containing team transaction records.
     * @returns {function(string): Array<object>} - A function that accepts a team ID and returns
     *                                              an array of period summaries. Each summary is an
     *                                              object detailing categorized amounts and balances.
     */
    incomePerRoundForTeam: (state) => (teamId) => {
      if (!gameplayStore) {
        gameplayStore = useGameplayStore();
      }

      const interestRounds = gameplayStore.gameplay?.scheduling?.interestRounds;
      if (!interestRounds || interestRounds.length < 2) {
        return [];
      }

      const records = state.records.get(teamId);
      if (!records) {
        return [];
      }

      const result = [];

      // Create a summary object for each period between interest rounds
      for (let i = 0; i < interestRounds.length - 1; i++) {
        const periodStart = interestRounds[i];
        const periodEnd   = interestRounds[i + 1];

        const periodSummary = {
          various:          0,
          gambling:         0,
          chancellery:      0,
          penalty:          0,
          propertyPurchase: 0,
          housePurchase:    0,
          rent:             0,
          hourlyFee:        0,
          interest:         0,
          sum:              0
        };

        // Filter and categorize transactions within this period
        for (const r of records) {
          const transactionTime = r.timestamp;

          // Check if transaction is within the current period
          if (transactionTime >= periodStart && transactionTime < periodEnd) {
            const amount = r.transaction.amount;

            switch (r.transaction.type) {
              case TEAM_TRANSACTION_GAMBLING:
                periodSummary.gambling += amount;
                break;
              case TEAM_TRANSACTION_HOURLY_FEE:
              case TEAM_TRANSACTION_START_FEE:
                periodSummary.hourlyFee += amount;
                break;
              case TEAM_TRANSACTION_CHANCELLERY:
                periodSummary.chancellery += amount;
                break;
              case TEAM_TRANSACTION_PENALTY_RATE:
                periodSummary.penalty += amount;
                break;
              case TEAM_TRANSACTION_PURCHASE_PROPERTY:
                periodSummary.propertyPurchase += amount;
                break;
              case TEAM_TRANSACTION_PURCHASE_HOUSE:
                periodSummary.housePurchase += amount;
                break;
              case TEAM_TRANSACTION_RENT:
                periodSummary.rent += amount;
                break;
              case TEAM_TRANSACTION_INTEREST:
                periodSummary.interest += amount;
                break;
              default:
                periodSummary.various += amount;
                break;
            }
          }
        }

        // Calculate sum of all categories
        periodSummary.balance = periodSummary.various + periodSummary.gambling +
          periodSummary.chancellery + periodSummary.penalty +
          periodSummary.propertyPurchase + periodSummary.housePurchase +
          periodSummary.rent + periodSummary.hourlyFee +
          periodSummary.interest;

        periodSummary.startTimestamp = interestRounds[i];
        periodSummary.endTimestamp   = interestRounds[i + 1];

        result.push(periodSummary);
      }

      return result;
    },
  },
  actions: {
    async loadTeamAccountEntries(gameId, teamId = 'all') {
      const self = this;
      try {
        console.log('TeamAccountStore.loadTeamAccountEntries start');
        let start         = this.lastValidTimestamp.toISO();
        const resp        = await axios.get(`/teamAccount/get/${gameId}/${teamId}/${start}`);
        const accountData = resp.data.accountData;
        this.bookTeamAccountEntries(accountData);

      }
      catch (err) {
        console.log(self, self.lastValidTimestamp);
        console.error(err);
      }
    },
    /**
     * Books the team account entries
     * @param accountData
     */
    bookTeamAccountEntries(accountData) {
      if (!accountData || accountData.length === 0) {
        return;
      }
      if (!teamsStore) {
        teamsStore = useTeamsStore();
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

        // Fast check for affected teams
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
  }
})
