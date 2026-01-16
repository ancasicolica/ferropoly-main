/**
 * Store for the check-in, the players app
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.01.2026
 **/

import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useCheckInStore = defineStore('CheckIn', () => {
  const menuBarElements = ref(   [
    {label: 'Übersicht', route: 'dashboard'},
    {label: 'Karte', route: 'map'},
    {label: 'Preisliste', route: 'pricelist'},
    {label: 'Besitz', route: 'property'},
    {label: 'Kontobuch', route: 'account'},
    {label: 'Bilder', route: 'pictures'},
    {label: 'Bild hochladen', route: 'upload'},
    {label: 'Statistik', route: 'statistics'},
    {label: 'Spielregeln', route: 'rules'},
  ]);
    const socketConnected = ref(   false);



  return {menuBarElements, socketConnected}
})
