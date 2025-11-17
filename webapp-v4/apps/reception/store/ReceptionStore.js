/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import {getAuthToken} from '../../../common/adapters/authToken';
import {ReceptionLogEntry} from '../lib/ReceptionLogEntry';

export const useReceptionStore = defineStore('Reception', {
  state:   () => ({
    gameId:             '',
    menuBarElements:    [
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
    socketConnected:    false,
    activeCall: {
      team: null,
      chancelleryEnabled: true,
      messageLog: [],
    }
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
    addCallLog(options) {
      this.activeCall.messageLog.unshift(new ReceptionLogEntry(options));
    },
    async startTeamCall(team, chancelleryEnabled) {
      const self = this;
      self.activeCall.team               = team;
      self.activeCall.chancelleryEnabled = chancelleryEnabled;
      self.addCallLog({message: 'Anruf gestartet'});
      if (chancelleryEnabled) {
        try {
          const authToken = await getAuthToken()
          const resp = await axios.post(`/chancellery/play/${this.gameId}/${team.uuid}`, {authToken});
          console.log('Chancellery', resp.data);
          self.addCallLog({
            title: 'Chance/Kanzlei',
            message: resp.data?.result.infoText,
            amount: resp.data?.result.amount
          });
        }
        catch (err) {
          console.error(err);
        }
      }
      console.log('Start call', team, chancelleryEnabled);
    },
    finishCall() {
      this.activeCall.team = null;
      this.activeCall.messageLog = [];
    }
  }
})
