<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <ferropoly-map
        ref="mapRef"
        :map-options="mapOptions"
        @map="onNewMap"
    />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import FerropolyMap from '../../../../common/components/FerropolyMap.vue';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {getMapMarkerInstance} from '../../../../lib/MapMarkers';

const propertyStore = usePropertyStore();
const mapMarkers    = getMapMarkerInstance();

// Create a template ref for the component
const mapRef = ref(null);

const mapOptions = {
  zoom: 14
};

let map = null;


const onNewMap = async function (_map) {
  console.log('new map', _map);
  map = _map;

  // Wait for propertyStore.ready with timeout
  const startTime = Date.now();
  while (!propertyStore.ready && (Date.now() - startTime) < 5000) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms between checks
  }

  console.log('>>>>  FINALLY READY', propertyStore.ready);
  // Access the component instance through mapRef.value
  if (mapRef.value && propertyStore.ready) {
    mapRef.value.setCenter(mapMarkers.getCenter());
    mapRef.value.fitBounds(mapMarkers.getBounds());
    mapMarkers.applyFilter(map);
  } else {
    console.warn('Map initialization skipped - propertyStore not ready or timeout reached');
  }
}


</script>

<style scoped lang="scss">
</style>
