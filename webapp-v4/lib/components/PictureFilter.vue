<!---
  Component for configuring the picture filter
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div>
    <Select
        v-model="picBucketStore.filterTeamId"
        :options="teams"
        size="small"
        fluid
        option-label="name"
        option-value="uuid"
        placeholder="Wähle ein Team"
        class="w-full md:w-56"
    />
    <InputText
        v-model="picBucketStore.searchQuery"
        type="text"
        fluid
        placeholder="Filtere nach Teamnamen oder Ort"
        size="small"
        class="mt-2"
    />
    <div class="flex items-center gap-2 mt-2">
      <Checkbox
          v-model="picBucketStore.sortAscending"
          binary
          size="small"
          input-id="sort-order"
      />
      <label for="sort-order">Aufsteigende Reihenfolge</label>
    </div>
    <div class="separator mt-2 mb-4" />


  </div>
</template>

<script setup>

import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import {usePicBucketStore} from '../store/PicBucketStore';
import {useTeamsStore} from '../store/TeamsStore';
import {computed} from 'vue';

const picBucketStore = usePicBucketStore();
const teamsStore     = useTeamsStore();
const teams          = computed(() => {
  const teams = [...teamsStore.teams];
  teams.unshift({uuid: null, name: 'Alle Teams'});
  return teams;
})
</script>

<style scoped lang="scss">
.separator {
  border-bottom: 1px solid #ccc;
}
</style>
