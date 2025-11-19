<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.11.2025
-->

<template>
  <div>
    <DataTable
        v-model:expanded-rows="expandedRows"
        data-key="_id"
        size="small"
        :value="teamAccountEntries"
        striped-rows
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
          header="Zeit"
      >
        <template #body="slotProps">
          {{ formatTime(slotProps.data.timestamp) }}
        </template>
      </Column>
      <Column
          field="transaction.info"
          header="Buchungstext"
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
      <Column
          field="transaction.parts"
          header="Teiltransaktionen"
      >
        <template #body="slotProps">
          <p>{{ slotProps.data._id }}</p>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div>all</div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import {computed, ref} from 'vue';                   // optional
import {formatPrice, formatTime} from '../../../../common/lib/formatters';

const expandedRows = ref({});

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

</script>

<style scoped lang="scss">

</style>
