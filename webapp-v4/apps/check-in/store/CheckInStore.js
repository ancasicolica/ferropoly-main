/**
 * Store for the check-in, the players app
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.01.2026
 **/

import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios';

export const useCheckInStore = defineStore('CheckIn', () => {
  const menuBarElements = ref([
    {label: 'Übersicht', route: 'dashboard'},
    {label: 'Karte', route: 'map'},
    {label: 'Preisliste', route: 'pricelist'},
    {label: 'Besitz', route: 'property'},
    {label: 'Kontobuch', route: 'account'},
    {label: 'Bilder', route: 'pictures'},
    {label: 'Bild hochladen', route: 'upload'},
    {label: 'Spielregeln', route: 'rules'},
  ]);

  const team = ref({
    uuid: '',
    data: {
      name: ''
    }
  });

  const fetchStaticData = async function (gameId) {
    this.gameId = gameId;
    console.log(`fetching data for ${gameId}`);
    const resp  = await axios.get(`/static/${gameId}`);
    console.log('Static data fetched', resp.data);
    return resp.data;
  }

  return {menuBarElements, team, fetchStaticData}
})
