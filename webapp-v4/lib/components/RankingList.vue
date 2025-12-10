<!---
  The ranking list for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.12.2025
-->

<template>
  <div>
    <DataTable
        :value="teamAccountStore.rankingList"
        striped-rows
        size="small"
    >
      <Column
          field="rank"
          header="Rang"
      >
        <template #body="{index}">
          {{ index + 1 }}
        </template>
      </Column>
      <Column
          field="teamName"
          header="Team"
      />
      <Column
          field="balance"
          header="Vermögen"
      >
        <template #body="{data}">
          {{ formatPrice(data.balance) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {useTeamAccountStore} from '../store/TeamAccountStore';
import {formatPrice} from '../../common/lib/formatters';

const teamAccountStore = useTeamAccountStore();
</script>

<style scoped lang="scss">

</style>
