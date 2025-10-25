<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <ferro-card
        title="Angemeldete Teams"
    >
      <div v-if="!teamsAvailable">Bisher haben sich noch keine Gruppen angemeldet</div>
      <div v-if="teamsAvailable">
        <DataTable
            :value="infoStore.teams"
            striped-rows
        >
          <Column
              field="name"
              header="Team-Name"
          />
          <Column
              field="organization"
              header="Organisation"
          />
          <Column
              field="teamLeaderName"
              header="Leitung"
          />
        </DataTable>
      </div>
    </ferro-card>
  </div>
</template>

<script setup>
import FerroCard from '../../../../common/components/FerroCard.vue';
import {useInfoStore} from '../../store/InfoStore';
import {computed} from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const infoStore = useInfoStore();

const teamsAvailable = computed(() => infoStore.teams.length > 0)

</script>

<style scoped lang="scss">

</style>
