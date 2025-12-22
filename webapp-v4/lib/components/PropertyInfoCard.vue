<!---
  A card with the property infos (Status, pictures,...)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.12.2025
-->

<template>
  <div
      ref="tableContainer"
      class="flex flex-col ml-2 mr-2"
      style="height: 80vh"
  >
    <h1 v-if="property">{{ property.location.name }} </h1>

    <scroll-panel
        v-if="property"
        style="height: 100%"
    >
      <Tabs value="0">
        <TabList>
          <Tab value="0">Ortinfo</Tab>
          <Tab value="1">Besitz</Tab>
          <Tab value="2">Bilder</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <property-base-info :property="property" />
          </TabPanel>
          <TabPanel value="1">
            <property-owner :property="property" />
          </TabPanel>
          <TabPanel value="2">
            <property-pictures :pictures="pictures" />
          </TabPanel>
        </TabPanels>
      </Tabs>


    </scroll-panel>
  </div>
</template>

<script setup>
import ScrollPanel from 'primevue/scrollpanel';

import PropertyBaseInfo from './PropertyBaseInfo.vue';
import PropertyOwner from './PropertyOwner.vue';
import PropertyPictures from './PropertyPictures.vue';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import {onBeforeUnmount, onMounted, ref} from 'vue';

const tableContainer = ref(null);
let resizeObserver   = null;

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => null
  },
  pictures: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const calculateSize = () => {
  if (tableContainer.value) {
    const rect                        = tableContainer.value.getBoundingClientRect();
    // Berechnet den Platz vom oberen Rand des Elements bis zum unteren Rand des Fensters
    const remainingHeight             = window.innerHeight - rect.top;
    // Setzt die Höhe (verhindert negative Werte)
    tableContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
  }
}
onMounted(() => {
  calculateSize();
  resizeObserver = new ResizeObserver(() => {
    calculateSize();
  });
  if (tableContainer.value) {
    resizeObserver.observe(tableContainer.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && tableContainer.value) {
    resizeObserver.unobserve(tableContainer.value);
  }
});

</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
}
</style>
