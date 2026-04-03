/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 25.10.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';
import FerropolyApiError from '../../../lib/FerropolyApiError';
import {DateTime} from 'luxon';
import {last} from 'lodash';
import {usePropertyStore} from '../../../lib/store/PropertyStore';

export const useInfoStore = defineStore('Info', {
  state:   () => ({
    menuBarElements: [
      {label: 'Info', route: 'root'},
      {label: 'Preisliste', route: 'pricelist'},
      {label: 'Karte', route: 'map'},
      {label: 'Spielregeln', route: 'rules'},
    ],
    dataLoaded:      false,
    gameInfo:        {
      date:        null,
      start:       '',
      end:         '',
      organisator: '',
      email:       '',
      phone:       '',
      gameName:    '',
    },
    gameId:          '',
    apiError:        null,
    teams:           [],
    rules:           {
      changelog: [],
      released:  ''
    }
  }),
  getters: {
    rulesDate(state) {
      if (state.rules.changelog.length === 0) {
        return DateTime.fromISO('2020-01-01T08:00').toJSDate();
      }
      return DateTime.fromISO(last(state.rules.changelog).date).toJSDate();
    }
  },
  actions: {
    /**
     * Fetches and processes data for a specific game using its game identifier.
     *
     * @param {string} gameId - The unique identifier of the game whose data is being fetched.
     * @return {Promise<void>} A Promise that resolves once the game data has been fetched and processed,
     * or rejects with an error if the operation fails.
     */
    async fetchData(gameId) {
      try {
        this.gameId = gameId;
        console.log(`Loading data for ${gameId}`);
        const resp = await axios.get(`/info/data/${gameId}`);
        this.teams = resp.data.teams;
        const gp   = resp.data.gameplay;
        console.log(resp.data, gp);
        this.gameInfo.date        = DateTime.fromISO(gp.scheduling.gameDate).toJSDate();
        this.gameInfo.start       = DateTime.fromISO(gp.scheduling.gameStart).toJSDate();
        this.gameInfo.end         = DateTime.fromISO(gp.scheduling.gameEnd).toJSDate();
        this.gameInfo.organisator = gp.owner.organisatorName;
        this.gameInfo.email       = gp.owner.organisatorEmail;
        this.gameInfo.phone       = gp.owner.organisatorPhone;
        this.gameInfo.gameName    = gp.gamename;

        this.rules.changelog = resp.data.rules.changelog;
        this.rules.released  = resp.data.rules.released;

        const propertyStore = usePropertyStore();
        await propertyStore.init(gameId, resp.data.pricelist);

        this.dataLoaded = true;
      }
      catch (err) {
        this.apiError = new FerropolyApiError(err);
      }
    }
  }
})
