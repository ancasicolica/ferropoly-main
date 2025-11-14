<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <div v-if="!pricelistAvailable">
      <ferro-jumbotron
          :title="infoStore.gameInfo.gameName"
          info="Sobald die Preisliste verfügbar ist, kannst Du die Karte anschauen. Komme später wieder vorbei!"
      >
      </ferro-jumbotron>
    </div>
    <div v-if="pricelistAvailable">
      <div class="flex flex-row w-full h-full">
        <div class="flex-1 min-w-0">
          <ferropoly-map
              ref="mapRef"
              :map-options="mapOptions"
              @map="onNewMap"
          />
        </div>
        <div class="w-128 flex-shrink-0">
          <info-map-filter />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useInfoStore} from '../store/InfoStore';
import {computed} from 'vue';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';
import FerropolyMap from '../../../common/components/FerropolyMap.vue';
import {ref} from 'vue';
import {usePropertyStore} from '../../../lib/store/PropertyStore';
import {getMapMarkerInstance} from '../../../lib/MapMarkers';
import InfoMapFilter from './map/InfoMapFilter.vue';
import {PROPERTY_FILTER_STATUS_NONE} from '../../../lib/constants/propertyStoreFilters';

const infoStore = useInfoStore();
let map         = null;

const propertyStore = usePropertyStore();
const mapMarkers    = getMapMarkerInstance();

// Create a template ref for the component
const mapRef = ref(null);

const mapOptions = ref({
  zoom: 14
});

const pricelistAvailable = computed(() => propertyStore.properties.size > 0)

const onNewMap = async function (_map) {
  console.log('new map', _map);
  map = _map;

  // Wait for propertyStore.ready with timeout
  const startTime = Date.now();
  while (!propertyStore.ready && (Date.now() - startTime) < 5000) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms between checks
  }

  propertyStore.filter.propertyStatus = PROPERTY_FILTER_STATUS_NONE;
  console.log('>>>>  FINALLY READY', propertyStore.ready);
  // Access the component instance through mapRef.value
  if (mapRef.value && propertyStore.ready) {
    console.log(mapMarkers.getBounds());
    mapRef.value.fitBounds(mapMarkers.getBounds());
    mapRef.value.setCenter(mapMarkers.getCenter());
    getMapMarkerInstance().setMap(map);

    await propertyStore.updateFilter();
    // mapMarkers.applyFilter(map);
  } else {
    console.warn('Map initialization skipped - propertyStore not ready or timeout reached');
  }
}

</script>

<style scoped lang="scss">

</style>

