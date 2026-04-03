<!---
  The map filters for the info app
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 14.11.2025
-->

<template>
  <div class="ferropoly-container">
    <div>
      <h3>Darstellung Orte</h3>
      <Checkbox
          v-model="propertyStore.showMarkersAsCategory"
          binary
          input-id="presentation"
          @update:model-value="onFilterUpdate"
      />
      <label
          class="ml-2"
          for="presentation"
      > Orte nach Erreichbarkeit einfärben
      </label>
      <div class="mt-2 mb-2">
        <Button
            label="Alle Orte auf Karte anzeigen"
            variant="outlined"
            size="small"
            @click="onClearFilters"
        />
      </div>
    </div>
    <div>
      <h3>Orte</h3>
      <info-pricelist @center-map="onCenterMap" />
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import InfoPricelist from './InfoPricelist.vue';
import {PROPERTY_FILTER_GROUP_NONE, PROPERTY_FILTER_UUID_NONE} from '../../../../lib/constants/propertyStoreFilters';
import {defineEmits} from 'vue';

const propertyStore = usePropertyStore();
const emit          = defineEmits(['center-map']);

function onFilterUpdate() {
  console.log('Filter updated', propertyStore.filter.propertyStatus);
  propertyStore.updateFilter();
}

function onCenterMap(info) {
  emit('center-map', info);
}

function onClearFilters() {
  propertyStore.filter.propertyUuid  = PROPERTY_FILTER_UUID_NONE;
  propertyStore.filter.propertyGroup = PROPERTY_FILTER_GROUP_NONE;
  propertyStore.updateFilter();
}
</script>

<style scoped lang="scss">

</style>
