<!---
  Log for a game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.01.2026
-->

<template>
  <div>
<DataTable
    :value="gameLogStore.currentEntries"
    :show-headers="false"
    size="small"
>
  <Column field="timestamp">
    <template #body="{data}">
      {{ formatTime(data.timestamp) }}
    </template>
  </Column>
  <Column field="title"></Column>
</DataTable>
  </div>
</template>

<script setup>
import {useGameLogStore} from '../../../../lib/store/GameLogStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {formatTime} from '../../../../common/lib/formatters';

const gameLogStore = useGameLogStore();

</script>

<style scoped lang="scss">

</style>
