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
import { ref } from 'vue';
import FerropolyMap from '../../../../common/components/FerropolyMap.vue';
import { usePropertiesStore } from '../../../../lib/store/Properties';

const propertiesStore = usePropertiesStore();

// Create a template ref for the component
const mapRef = ref(null);

const mapOptions = {
  zoom: 14
};

let map = null;

const onNewMap = function (_map) {
  console.log('new map');
  map = _map;
  const propertyList = propertiesStore.getPropertyList;
  propertyList.showAllPropertiesOnMap(map);
  
  // Access the component instance through mapRef.value
  if (mapRef.value) {
    mapRef.value.setCenter(propertyList.getCenter());
    mapRef.value.fitBounds(propertyList.getBounds());
  }
}
</script>

<style scoped lang="scss">
</style>
