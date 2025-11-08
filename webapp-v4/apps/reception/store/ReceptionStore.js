/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/

import {defineStore} from 'pinia'

export const useReceptionStore = defineStore('Reception', {
  state:   () => ({
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
    ]
  }),
  getters: {},
  actions: {}
})
