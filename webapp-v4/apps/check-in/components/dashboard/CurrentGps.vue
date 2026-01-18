<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.2026
-->

<template>
  <div>
    <div class="shadow-md p-4 rounded-lg bg-white max-w-md">
      <h3>GPS</h3>
      <div v-if="!positionIsValid"> Keine aktuelle Position verfügbar.</div>
      <div v-else> Aktuelle Position:
        <a
            :href="targetLink"
            target="_blank"
        >
          {{ lastPositionText }} &pm; {{ accuracy }}m
        </a>
      </div>
      <Button
          severity="info"
          size="small"
          @click="updateGps"
      >
        GPS aktualisieren
      </Button>
    </div>
  </div>
</template>

<script setup>
import {useGeoLocationStore} from '../../store/GeoLocationStore';
import {computed} from 'vue';

import Button from 'primevue/button';

const geoLocationStore = useGeoLocationStore();

const positionIsValid = computed(() => {
  return (geoLocationStore.positionIsValid);
})

const targetLink = computed(() => {
  return `https://maps.google.ch/?q=${geoLocationStore.currentPosition.lat},${geoLocationStore.currentPosition.lng}`
})

const roundCoordinate  = function (coordinate) {
  return Math.round(coordinate * 10000) / 10000;
}
const lastPositionText = computed(() => {
  if (geoLocationStore.currentPosition && geoLocationStore.currentPosition.lat) {
    return `${roundCoordinate(geoLocationStore.currentPosition.lat)}, ${roundCoordinate(geoLocationStore.currentPosition.lng)}`
  }
  return '';
});

const accuracy = computed(() => {
  if (geoLocationStore.currentPosition && geoLocationStore.currentPosition.lat) {
    return `${geoLocationStore.currentPosition.accuracy}`;
  }
  return '';
})

const updateGps = function () {
  geoLocationStore.localize();
}
</script>

<style scoped lang="scss">

</style>
