<template>
  <div class="w-full">
    <ferro-card
        title="Transaktionen"
        condensed
    >
      <div ref="tableContainer">
        <DataTable
            :value="records"
            striped-rows
            size="small"
            scrollable
            scroll-height="flex"

            :virtual-scroller-options="{ itemSize: 44 }"
        >
          <Column
              field="timestamp"
              header="Zeit"
              :sortable="true"
              style="width: 100px"
          >
            <template #body="slotProps">
              {{ formatTime(slotProps.data.timestamp) }}
            </template>
          </Column>
          <Column
              field="transaction.team"
              header="Team"
              :sortable="true"
          >
            <template #body="slotProps">
              {{ slotProps.data.transaction.team }}
            </template>
          </Column>
          <Column
              field="transaction.info"
              header="Info"
          >
            <template #body="slotProps">
              {{ slotProps.data.transaction.info }}
            </template>
          </Column>
          <Column
              field="transaction.amount"
              header="Betrag"
              style="width: 110px"
          >
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.transaction.amount) }}
            </template>
          </Column>
          <Column
              field="transaction.amout"
              header="Saldo"
              style="width: 110px"
          >
            <template #body="slotProps">
              {{ formatPrice(slotProps.data.balance) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </ferro-card>
  </div>
</template>

<script setup>
// The parent provides the available height. We convert it into a fixed DataTable scroll height.
// This avoids relying on FerroCard being flex-capable.
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import FerroCard from '../../common/components/FerroCard.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {useChancelleryStore} from '../store/ChancelleryStore';
import {formatPrice, formatTime} from '../../common/lib/formatters';

const chancelleryStore = useChancelleryStore();

const records = computed(() => {
  return [...chancelleryStore.records.values()];
});

let resizeObserver   = null;
const tableContainer = ref(null);

/**
 * Adjusts the height of the referenced tableContainer element dynamically,
 * ensuring it fits within the available vertical space in the viewport.
 *
 * Dependencies:
 * - The function assumes `tableContainer` is a reactive reference to a DOM element (e.g., using Vue's ref or similar).
 */
const adjustHeight = () => {
  if (tableContainer.value) {
    const rect                        = tableContainer.value.getBoundingClientRect();
    // Berechnet den Platz vom oberen Rand des Elements bis zum unteren Rand des Fensters
    const remainingHeight             = window.innerHeight - rect.top - 20;
    // Setzt die Höhe (verhindert negative Werte)
    tableContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
  }
};


onMounted(() => {
  // Initiale Berechnung
  adjustHeight();

  // Bei Änderung der Fenstergröße neu berechnen
  window.addEventListener('resize', adjustHeight);

  // ResizeObserver überwacht nun den Body, um Layout-Verschiebungen
  // (z.B. Banner wird größer/kleiner) zu erkennen.
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
</style>
