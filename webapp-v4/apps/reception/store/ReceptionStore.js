/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {getAuthToken} from '../../../common/adapters/authToken';
import {LOG_TYPE_FAIL, LOG_TYPE_INFO, LOG_TYPE_SUCCESS, ReceptionLogEntry} from '../lib/ReceptionLogEntry';
import {get} from 'lodash';
import {formatPrice} from '../../../common/lib/formatters';

export const useReceptionStore = defineStore('Reception', {
  state:   () => ({
    gameId:            '',
    menuBarElements:   [
      {label: 'Übersicht', route: 'dashboard'},
      {label: 'Anruf behandeln', route: 'call'},
      {label: 'Karte', route: 'map'},
      {label: 'Bilder', route: 'pictures'},
      {label: 'Statistik', route: 'statistics'},
      {label: 'Kontobuch', route: 'accounting'},
      {label: 'Chance/Kanzlei', route: 'chance'},
      {label: 'Preisliste', route: 'pricelist'},
      {
        label: 'Diverses', eventParam: 'params',
        items: [{label: 'Spielregeln', route: 'rules'},
                {label: 'Service', route: 'service'}
        ]
      },
    ],
    socketConnected:   false,
    activeCall:        {
      team:               null,
      chancelleryEnabled: true,
      messageLog:         [],
    },
    paginationEnabled: false,
    accountingTeamId:  null,
  }),
  getters: {
    callActive(state) {
      return state.activeCall.team !== null;
    }
  },
  actions: {
    /**
     * Fetches static data for a given game ID.
     *
     * @param {string} gameId - The unique identifier of the game for which static data needs to be fetched.
     * @return {Promise<Object>} A promise that resolves to the static data of the specified game.
     */
    async fetchStaticData(gameId) {
      this.gameId = gameId;
      const resp  = await axios.get(`/static/${gameId}`);
      console.log(resp.data);
      return resp.data;
    },
    /**
     * Adds a call log entry
     * @param options
     */
    addCallLog(options) {
      this.activeCall.messageLog.unshift(new ReceptionLogEntry(options));
    },
    /**
     * Starts a call of a team
     * @param team
     * @param chancelleryEnabled
     * @return {Promise<void>}
     */
    async startTeamCall(team, chancelleryEnabled) {
      const self                         = this;
      self.activeCall.team               = team;
      self.activeCall.chancelleryEnabled = chancelleryEnabled;
      self.addCallLog({message: 'Anruf gestartet'});
      if (chancelleryEnabled) {
        try {
          const authToken = await getAuthToken()
          const resp      = await axios.post(`/chancellery/play/${self.gameId}/${team.uuid}`, {authToken});
          console.log('Chancellery', resp.data);
          self.addCallLog({
            title:   undefined,
            message: resp.data?.result.infoText,
            amount:  resp.data?.result.amount
          });
        }
        catch (err) {
          console.error(err);
        }
      }
      console.log('Start call', team, chancelleryEnabled);
    },
    /**
     * Finishes a call
     */
    finishCall() {
      this.activeCall.team       = null;
      this.activeCall.messageLog = [];
    },
    /**
     * Runs gambling for the current team in the call
     * @param amount
     */
    async gamble(amount) {
      const self = this;
      try {
        const authToken = await getAuthToken()
        const resp      = await axios.post(`/chancellery/gamble/${self.gameId}/${self.activeCall.team.uuid}`, {
          authToken,
          amount
        });
        self.addCallLog({
          message: resp.data?.result.infoText,
          amount:  resp.data?.result.amount
        });
      }
      catch (err) {
        console.error(err);
        self.addCallLog({title: 'Fehler bei Abfrage', message: err.message, type: LOG_TYPE_FAIL});
      }
    },
    /**
     * Attempts to purchase a property in the marketplace for a specific team.
     * Logs the outcome of the operation, whether successful, failed, or already owned.
     *
     * @param {string} teamId - The unique identifier for the team attempting to buy the property.
     * @param {string} propertyId - The unique identifier for the property being purchased.
     *
     * @return {Promise<void>} A promise that resolves when the operation is complete and relevant logs are recorded.
     */
    async buyProperty(teamId, propertyId) {
      const self = this;
      try {
        const authToken = await getAuthToken();
        const resp      = await axios.post(`/marketplace/buyProperty/${self.gameId}/${teamId}/${propertyId}`,
          {authToken});
        console.log(resp.data);
        const res = resp.data.result;
        if (res.owner) {
          // belongs to another team
          self.addCallLog({
            title:   'Kauf nicht möglich',
            message: `${get(res, 'property.location.name', 'unbekanntes Ort')} ist bereits verkauft, Mietzins ${formatPrice(res.amount)} CHF.`,
            type:    LOG_TYPE_FAIL
          });
        } else if (res.amount === 0) {
          // our own
          self.addCallLog({
            title:   'Kauf nicht möglich',
            message: `${get(res, 'property.location.name', 'unbekanntes Ort')} gehört bereits der anrufenden Gruppe.`,
            type:    LOG_TYPE_INFO
          });
        } else {
          // bought !!!
          self.addCallLog({
            title:   'Kauf erfolgreich',
            message: `${get(res, 'property.location.name', 'unbekanntes Ort')} wurde für ${formatPrice(res.amount)} CHF gekauft. `,
            type:    LOG_TYPE_SUCCESS
          });
        }
      }
      catch (err) {
        console.error(err);
        self.addCallLog({title: 'Fehler bei Kauf', message: err.message, type: LOG_TYPE_FAIL});
      }
    },
    /**
     * Builds houses for a team in the marketplace and logs the results.
     *
     * @param {number|string} teamId - The ID of the team for which houses are to be built.
     * @return {Promise<void>} A Promise that resolves once the operation is complete.
     */
    async buildHouses(teamId) {
      const self = this;
      try {
        const authToken = await getAuthToken();
        const resp      = await axios.post(`/marketplace/buildHouses/${self.gameId}/${teamId}`,
          {authToken});
        const res       = resp.data.result;
        if (res.amount === 0) {
          self.addCallLog({
            title:   'Häuserbau',
            message: `Es konnten keine Häuser gebaut werden.`,
            type:    LOG_TYPE_INFO
          });
        } else {
          let msg = `Belastung: ${formatPrice(res.amount)}, Gebaute Häuser: `;
          res.log.forEach(e => {
            msg += `${e.propertyName} (${e.buildingNb} / ${formatPrice(e.amount)}) `;
          })
          self.addCallLog({
            title:   'Häuserbau',
            message: msg,
            type:    LOG_TYPE_SUCCESS
          });
        }
      }
      catch (err) {
        console.error(err);
        self.addCallLog({title: 'Fehler beim Häuserbau', message: err.message, type: LOG_TYPE_FAIL});
      }
    }
  }
})
