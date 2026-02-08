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
          :expanded-rows="expandedRows"
          data-key="_id"
          size="small"
          :value="teamAccountEntries"
          striped-rows
          class="flex-auto"
          sort-field="timestamp"
          :sort-order="sortOrder"
          scrollable
          scroll-height="flex"
          table-style="table-layout: fixed"
          :virtual-scroller-options="{ itemSize: 38 }"
          @update:sort-order="onSortOrder"
      >
        <Column
            expander
            :style="styleExpander"
        >
          <template #body="{data, rowTogglerCallback}">

          <span
              v-if="data.transaction.parts && data.transaction.parts.length > 0"
              class="pi pi-info-circle"
              @click="rowTogglerCallback"
          />
          </template>
        </Column>

        <Column
            field="timestamp"
            header="Zeit"
            :sortable="true"
            :style="styleTimestamp"
        >
          <template #body="slotProps">
            <div v-if="smallWindow"> {{ formatGameTime(slotProps.data.timestamp) }}</div>
            <div v-else> {{ formatTime(slotProps.data.timestamp) }}</div>
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
            :style="styleAmount"
        >
          <template #header>
            <div class="w-full text-right">Betrag</div>
          </template>
          <template #body="slotProps">
            <div class="amount">{{ formatPrice(slotProps.data.transaction.amount) }}</div>
          </template>
        </Column>
        <Column
            field="balance"
            :style="styleBalance"
        >
          <template #header>
            <div class="w-full text-right">Saldo</div>
          </template>
          <template #body="slotProps">
            <div class="amount"> {{ formatPrice(slotProps.data.balance) }} </div>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div>
            <div
                v-for="t in slotProps.data.transaction.parts"
                :key="t.uuid"
                class="flex flex-row"
            >
              <div
                  :class="getTransactionClass(t.buildingNb)"
                  :style="styleTransactionParts"
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
import {formatGameTime, formatPrice, formatTime} from '../../../common/lib/formatters';
import {useTeamAccountStore} from '../../store/TeamAccountStore';

const expandedRows     = ref({});
const tableContainer   = ref(null);
const windowWidth      = ref(window.innerWidth);
const smallWindowWidth = 768;
const emit             = defineEmits(['update:sort-order']);

const onSortOrder = function (value) {
  emit('update:sort-order', value);
};

let resizeObserver = null;

const props = defineProps({
  teamId:    {
    type:     String,
    required: true,
    default:  ''
  },
  sortOrder: {
    type:     Number,
    required: false,
    default:  1
  }
})

const teamAccountStore   = useTeamAccountStore();
const teamAccountEntries = computed(() => teamAccountStore.records.get(props.teamId));

const smallWindow=computed(()=> {
  return windowWidth.value < smallWindowWidth;
})

const styleExpander = computed(() => {
  return windowWidth.value < smallWindowWidth ? 'width: 20px' : 'width: 25px';
})

const styleTimestamp = computed(() => {
  return windowWidth.value < smallWindowWidth ? 'width: 55px' : 'width: 150px';
})

const styleAmount = computed(() => {
  return windowWidth.value < smallWindowWidth ? 'width: 70px' : 'width: 200px';
})

const styleBalance = computed(() => {
  return windowWidth.value < smallWindowWidth ? 'width: 90px' : 'width: 200px';
})

const styleTransactionParts = computed(() => {
  return windowWidth.value < smallWindowWidth ? 'width: 100%' : 'width: 600px';
})

const getTransactionClass = (buildingNb) => {
  if (buildingNb) {
    return "grid grid-cols-3 gap-1"
  }
  return "grid grid-cols-2 gap-1"
}
/**
 * Adjusts the height of the referenced tableContainer element dynamically,
 * ensuring it fits within the available vertical space in the viewport.
 *
 * Dependencies:
 * - The function assumes `tableContainer` is a reactive reference to a DOM element (e.g., using Vue's ref or similar).
 */
const adjustHeight = () => {
  windowWidth.value = window.innerWidth;
  if (tableContainer.value) {
    const rect                        = tableContainer.value.getBoundingClientRect();
    // Calculate the space from the top of the element to the bottom of the window
    const remainingHeight             = window.innerHeight - rect.top - 20;
    // Set the height (prevent negative values)
    tableContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
  }
};

onMounted(() => {
  // Initial calculation
  adjustHeight();

  // Recalculate on window resize
  window.addEventListener('resize', adjustHeight);

  // ResizeObserver monitors the body to detect layout shifts
  // (e.g., banner becomes larger/smaller).
  resizeObserver = new ResizeObserver(() => {
    adjustHeight();
  });

  resizeObserver.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustHeight);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

</script>

<style scoped lang="scss">
.amount {
  text-align: right;
}
</style>
