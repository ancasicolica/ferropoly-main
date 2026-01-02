<!---
  Bookings of a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.12.2025
-->

<template>
  <div>
    <h4>Buchungen</h4>
    <DataTable
        :value="bookings"
        striped-rows
        size="small"
    >
      <Column
          field="timestamp"
          header="Zeit"
      >
        <template #body="{data}">
          <div> {{ formatGameTime(data.timestamp) }}</div>
        </template>
      </Column>
      <Column
          field="info"
          header="Info"
      >
        <template #body="{data}">
          <div> {{ data.info }}
            <span
                v-if="data.amount > 0 && data.sponsorTeamId"
            >
             von {{ teamsStore.idToTeamName(data.sponsorTeamId) }}
           </span>
          </div>
        </template>
      </Column>
      <Column
          field="amount"
          header="Betrag"
          header-class="text-right"
      >
        <template #body="{data}">
          <div
              class="text-right"
          >
            {{ formatPrice(data.amount) }}
          </div>
        </template>
      </Column>
      <Column
          header="Profit"
          header-class="text-right"
      >
        <template #body="{data}">
          <div
              class="text-right"
              :class="{ 'negative-amount': data.balance < 0 }"
          >
            {{ formatPrice(data.balance) }}
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {computed} from 'vue';
import {formatGameTime, formatPrice} from '../../../common/lib/formatters';
import {useTeamsStore} from '../../store/TeamsStore';

const teamsStore = useTeamsStore();

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => null
  }
})

const bookings = computed(() => {
  let runningBalance = 0;
  const transactions = [...props.property.account.transactions.values()];

  // Sort transactions by timestamp if they are not already sorted
  const sorted = transactions.sort((a, b) => a.timestamp - b.timestamp);

  return sorted.map(transaction => {
    runningBalance += transaction.amount;
    return {
      ...transaction,
      balance: runningBalance
    };
  });
});

</script>

<style scoped lang="scss">
.negative-amount {
  color: red;
}
</style>
