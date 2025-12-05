<!---
  Pricelist created for the game and afterwards, including the game data
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.12.2025
-->

<template>
  <div
      ref="tableContainer"
      class="flex flex-col"
      style="height: 100%; background-color: #4d9be8;"
  >
    <DataTable
        :value="properties"
        class="p-datatable-striped"
        size="small" paginator
        :rows="rowsPerPage"
    >
      <Column field="pricelist.position" sortable header="Pos.">
        <template #body="slotProps">
          <div> {{ slotProps.data.pricelist.position + 1 }}</div>
        </template>
      </Column>
      <Column field="location.name" sortable header="Ort">
        <template #body="slotProps">
          <div> {{ slotProps.data.location.name }}</div>
        </template>
      </Column>
      <Column field="pricelist.propertyGroup" sortable header="Gruppe">
        <template #body="slotProps">
          <div> {{ slotProps.data.pricelist.propertyGroup }}</div>
        </template>
      </Column>
      <Column field="gamedata.owner" sortable header="Besitzer">
        <template #body="slotProps">
          <div> {{ slotProps.data.gamedata.owner }}</div>
        </template>
      </Column>
      <Column field="gamedata.buildings" sortable header="Status">
        <template #body="slotProps">
          <div> {{ slotProps.data.gamedata.buildings }}</div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';
import {onBeforeUnmount, onMounted, ref} from 'vue';                   // optional
const tableContainer = ref(null);
const rowsPerPage = ref(10);
let resizeObserver = null;

const props = defineProps({
  properties: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const calculateRows = () => {
  if (!tableContainer.value) return;

  const rect = tableContainer.value.getBoundingClientRect();
  const containerHeight = tableContainer.value.clientHeight;

  // Estimate: Header (~50px) + Paginator (~64px) + Padding (~20px) = 130px non-row space
  const availableHeight = containerHeight -37-56;
  // Estimate: Row height ~24px for small size
  const calculatedRows = Math.floor(availableHeight / 37);
  rowsPerPage.value = Math.max(1, calculatedRows);

  console.log(`Calculated ${rowsPerPage.value} rows for ${availableHeight}px height, containerHeight:${containerHeight}`);
};

onMounted(() => {
  calculateRows();
  resizeObserver = new ResizeObserver(() => {
    calculateRows();
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

</style>
