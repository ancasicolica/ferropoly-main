/**
 * The store for the summary app
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.12.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';

export const useSummaryStore = defineStore('Summary', {
  state:   () => ({
    gameId:          '',
    menuBarElements: [
      {label: 'Übersicht', route: 'dashboard'},
      {label: 'Karte', route: 'map'},
      {label: 'Bilder', route: 'pictures'},
      {label: 'Statistik', route: 'statistics'},
      {label: 'Kontobuch', route: 'accounting'},
      {label: 'Chance/Kanzlei', route: 'chance'},
      {label: 'Ortsliste', route: 'pricelist'}
    ],
  }),
  getters: {},
  actions: {
    async fetchData(gameId) {
      this.gameId = gameId;
      const resp  = await axios.get(`/summary/${gameId}/static`);
      console.log('Static data fetched', resp.data);
      return resp.data;
    }
  }
})
