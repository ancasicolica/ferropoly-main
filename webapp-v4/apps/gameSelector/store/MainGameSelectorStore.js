/**
 * Store for the main seelctor module
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 11.10.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios'
import {get} from 'lodash'
import FerropolyApiError from '../../../lib/FerropolyApiError';

export const useMainGameSelectorStore = defineStore('MainGameSelector', {
  state:   () => ({
    menuBarElements: [],
    gameplays: [], // the ones as admin
    games: [], // the ones as player
    apiError: null
  }),
  getters: {},
  actions: {
    /**
     * Read the data for the Game selector
     * @return {Promise<void>}
     */
    async fetchData() {
      try {
        this.apiError = null;
        const resp = await axios.get('/gameplays')
        this.gameplays = get(resp, 'data.gameplays', []);
        this.games = get(resp, 'data.games', []);

        for(let gp of this.gameplays) {
          gp.scheduling.gameDate = new Date(gp.scheduling.gameDate);
          gp.scheduling.deleteTs = new Date(gp.scheduling.deleteTs);
        }
      }
      catch(err) {
        this.apiError = new FerropolyApiError(err);
      }

    }
  }
})
