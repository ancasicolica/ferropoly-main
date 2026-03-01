<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div class="w-full h-full">
    <div class="flex flex-row w-full h-full">
      <ferropoly-map
          ref="mapRef"
          :map-options="mapOptions"
          class="w-full h-full"
          @map="onNewMap"
      />
    </div>
  </div>
</template>

<script setup>

import FerropolyMap from '../../../../common/components/FerropolyMap.vue';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {getMapMarkerInstance} from '../../../../lib/MapMarkers';
import {MARKER_MODE_RECEPTION} from '../../../../lib/constants/markerMode';
import {getMapRoutesInstance} from '../../../../lib/MapRoutes';
import {ref} from 'vue';
import {useCheckInStore} from '../../store/CheckInStore';
import {PROPERTY_FILTER_STATUS_ALL} from '../../../../lib/constants/propertyStoreFilters';

const checkInStore  = useCheckInStore();
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

  console.log('>>>> CHECK-IN MAP FINALLY READY', propertyStore.ready);
  // Access the component instance through mapRef.value
  if (mapRef.value && propertyStore.ready) {
    console.log(mapMarkers.getBounds());
    propertyStore.markerMode   = MARKER_MODE_RECEPTION;
    propertyStore.filter.teams = [checkInStore.team.uuid];
    propertyStore.filter.propertyStatus = PROPERTY_FILTER_STATUS_ALL;
    mapRef.value.fitBounds(mapMarkers.getBounds());
    mapRef.value.setCenter(mapMarkers.getCenter());
    getMapMarkerInstance().setMap(map);
    getMapRoutesInstance().setMap(map);

    await propertyStore.update();
    propertyStore.updateFilter();
    getMapRoutesInstance().refreshRoutes();
    // mapMarkers.applyFilter(map);
  } else {
    console.warn('Map initialization skipped - propertyStore not ready or timeout reached');
  }
}

</script>

<style scoped lang="scss">

</style>
