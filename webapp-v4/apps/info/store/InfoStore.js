/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 25.10.2025
 **/

import {defineStore} from 'pinia'

export const useInfoStore = defineStore('Info', {
  state:   () => ({
    menuBarElements: [
      {label: 'Info', route: 'root'},
      {label: 'Preisliste', route: 'pricelist'},
      {label: 'Karte', route: 'map'},
      {label: 'Spielregeln', route: 'rules'},
    ]
  }),
  getters: {},
  actions: {}
})
