/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/

import {defineStore} from 'pinia'
import axios from 'axios';

export const useReceptionStore = defineStore('Reception', {
  state:   () => ({
    gameId: '',
    menuBarElements: [
      {label: 'Übersicht', route:'dashboard'},
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
    socketConnected: false
  }),
  getters: {},
  actions: {
    async fetchStaticData(gameId) {
      this.gameId = gameId;
      const resp  = await axios.get(`/static/${gameId}`);
      console.log(resp.data);
      return resp.data;
    }
  }
})
