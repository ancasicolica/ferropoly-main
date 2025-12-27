/**
 * The store for the summary app
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.12.2025
 **/

import {defineStore} from 'pinia'

export const useSummaryStore = defineStore('Summary', {
  state:   () => ({
    menuBarElements:   [
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
  actions: {}
})
