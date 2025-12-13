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
    <ScrollPanel style="height: 100%">
      <DataTable
          v-model:expanded-rows="expandedRows"
          data-key="_id"
          size="small"
          :value="teamAccountEntries"
          striped-rows
          :paginator="props.paginatorEnabled"
          paginator-position="top"
          :rows="rowsPerPage"
          class="flex-auto"
          sort-field="timestamp"
          :sort-order="sortOrder"
          scrollable
          scroll-height="flex"
          @update:sort-order="onSortOrder"
      >
        <Column
            expander
            style="width: 5rem"
        >
          <template #body="{data, rowTogglerCallback}">

          <span
              v-if="data.transaction.parts.length > 0"
              class="pi pi-info-circle"
              @click="rowTogglerCallback"
          />
          </template>
        </Column>

        <Column
            field="timestamp"
            header="Zeit"
            :sortable="true"
        >
          <template #body="slotProps">
            {{ formatTime(slotProps.data.timestamp) }}
          </template>
        </Column>
        <Column
            field="transaction.info"
            header="Beschreibung"
        >
          <template #body="slotProps">
            {{ slotProps.data.transaction.info }}
          </template>
        </Column>
        <Column
            field="transaction.amount"
            header="Betrag"
        >
          <template #body="slotProps">
            {{ formatPrice(slotProps.data.transaction.amount) }}
          </template>
        </Column>
        <Column
            field="balance"
            header="Saldo"
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
    </ScrollPanel>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ScrollPanel from 'primevue/scrollpanel';

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {formatPrice, formatTime} from '../../../../common/lib/formatters';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';

const expandedRows   = ref({});
const tableContainer = ref(null);
const rowsPerPage    = ref(10);

const emit = defineEmits(['update:sort-order']);

const onSortOrder = function (value) {
  emit('update:sort-order', value);
};


let resizeObserver = null;

const props = defineProps({
  teamId:           {
    type:     String,
    required: true,
    default:  ''
  },
  paginatorEnabled: {
    type:     Boolean,
    required: false,
    default:  false
  },
  sortOrder:        {
    type:     Number,
    required: false,
    default:  1
  }
})

const teamAccountStore = useTeamAccountStore();
const teamAccountEntries = computed(() => teamAccountStore.records.get(props.teamId));

const calculateRows = () => {
  if (!tableContainer.value) {
    return;
  }
  const containerHeight = tableContainer.value.clientHeight;
  // Estimate: Header (~50px) + Paginator (~60px) + Padding (~20px) = 130px non-row space
  const availableHeight = containerHeight - 130;
  // Estimate: Row height ~40px for small size
  const calculatedRows  = Math.floor(availableHeight / 40);
  rowsPerPage.value     = Math.max(1, calculatedRows);
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
