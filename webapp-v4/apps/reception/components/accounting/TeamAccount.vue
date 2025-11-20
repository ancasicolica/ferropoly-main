<!---
  Table with the team account bookings
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.11.2025
-->

<template>
  <div
      ref="tableContainer"
      class="flex flex-col"
      style="height: calc(100vh - 12rem)"
  >
    <DataTable
        v-model:expanded-rows="expandedRows"
        data-key="_id"
        size="small"
        :value="teamAccountEntries"
        striped-rows
        paginator
        paginator-position="top"
        :rows="rowsPerPage"
        class="flex-auto"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
    >
      <Column
          expander
          style="width: 5rem"
      >
        <template #body="{data, rowTogglerCallback}">
          <span
              v-if="data.transaction.parts.length > 0"
              class="pi pi-chevron-right"
              @click="rowTogglerCallback"
          />
        </template>
      </Column>

      <Column
          field="timestamp"
          header="Time"
      >
        <template #body="slotProps">
          {{ formatTime(slotProps.data.timestamp) }}
        </template>
      </Column>
      <Column
          field="transaction.info"
          header="Description"
      >
        <template #body="slotProps">
          {{ slotProps.data.transaction.info }}
        </template>
      </Column>
      <Column
          field="transaction.amount"
          header="Amount"
      >
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.transaction.amount) }}
        </template>
      </Column>
      <Column
          field="balance"
          header="Balance"
      >
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.balance) }}
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="flex flex-col items-center">
          <div
              v-for="t in slotProps.data.transaction.parts"
              :key="t.uuid"
              class="flex flex-row"
          >
            <div
                class="grid grid-cols-3 gap-4"
                style="width: 600px"
            >
              <div> {{ t.propertyName }}</div>
              <div v-if="t.buildingNb > 0 && t.buildingNb < 5"> {{ t.buildingNb }}. Haus</div>
              <div v-if="t.buildingNb > 4"> Hotel</div>
              <div> {{ formatPrice(t.amount) }}</div>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {formatPrice, formatTime} from '../../../../common/lib/formatters';

const expandedRows = ref({});
const tableContainer = ref(null);
const rowsPerPage = ref(10);
let resizeObserver = null;

const props              = defineProps({
  teamId:  {
    type:     String,
    required: true,
    default:  ''
  },
  entries: {
    type:     Array,
    required: true,
    default:  () => []
  }
})
const onRowExpand        = (event) => {
  console.log('expand')
};
const onRowCollapse      = (event) => {
  console.log('collapse')
};
const teamAccountEntries = computed(() => props.entries.filter(entry => entry.teamId === props.teamId));

const calculateRows = () => {
  if (!tableContainer.value) return;
  const containerHeight = tableContainer.value.clientHeight;
  // Estimate: Header (~50px) + Paginator (~60px) + Padding (~20px) = 130px non-row space
  const availableHeight = containerHeight - 130;
  // Estimate: Row height ~40px for small size
  const calculatedRows = Math.floor(availableHeight / 40);
  rowsPerPage.value = Math.max(1, calculatedRows);
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
