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
    console.log('new position', pos);
    currentPosition.value = pos;
  });
  geograph.on('player-position-error', () => {
    console.warn('Geograph error: no position available');
    currentPosition.value = null;
  })

  const init = function () {
    geograph.startTracking();
  };

  const positionIsValid = computed(() => {
    if (!currentPosition.value) {
      return false;
    }
    return currentPosition.value.lat !== 0;
  })

  const localize = function() {
    geograph.localize();
  }

  return {currentPosition, init, positionIsValid, localize}
})
