/**
 * Store for geolocation
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.01.2026
 **/

import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import geograph from '../lib/geograph';

export const useGeoLocationStore = defineStore('GeoLocation', () => {
  const currentPosition = ref({lat: 0, lng: 0, accuracy: 0});

  geograph.on('player-position-update', (pos) => {
    currentPosition.value = pos;
  });
  geograph.on('player-position-error', () => {
    currentPosition.value = null;
  })

  const init = function () {
    geograph.localize();
    geograph.startPeriodicScan(10000);
  };

  const positionIsValid = computed(() => {
    return geograph.positionIsValid();
  })

  return {currentPosition, init, positionIsValid}
})
