<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 13.12.2025
-->

<template>
  <div>
    <ferro-card
        title="Liegenschaften"
        condensed
    >
      <p class="mb-2">Anzahl Liegenschaften: {{ teamProperties.length }}</p>
      <DataTable
          :value="teamProperties"
          striped-rows
          size="small"
          scrollable
          scroll-height="flex"
      >
        <Column
            field="location.name"
            header="Ort"
        />
        <Column
            field="pricelist.position"
            header="Pos."
        >
          <template #body="{data}">
            {{ data.pricelist.position + 1 }}
          </template>
        </Column>
        <Column
            field="pricelist.price"
            header="Kaufpreis"
        >
          <template #body="{data}">
            {{ formatPrice(data.pricelist.price) }}
          </template>
        </Column>
        <Column
            field="gamedata.buildings"
            header="Häuser"
        >
          <template #body="{data}">
            {{ buildingStatus(data.gamedata.buildings) }}
          </template>
        </Column>
        <Column
            field="gamedata.buildingEnabled"
            header="Hausbau"
        >
          <template #body="{data}">
            <div v-if="data.gamedata.buildingEnabled && data.gamedata.buildings < 5">
              <Button
                  label="Haus bauen"
                  size="small"
                  severity="secondary"
                  @click="receptionStore.buildHouse(receptionStore.activeCall.team.uuid, data.uuid)"
              />
            </div>
            <div v-if="!data.gamedata.buildingEnabled || data.gamedata.buildings >= 5">
              nicht möglich
            </div>
          </template>
        </Column>
      </DataTable>

    </ferro-card>

  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import Button from 'primevue/button';


import FerroCard from '../../../../../common/components/FerroCard.vue';
import {computed} from 'vue';
import {usePropertyStore} from '../../../../../lib/store/PropertyStore';
import {useReceptionStore} from '../../../store/ReceptionStore';
import {buildingStatus, formatPrice} from '../../../../../common/lib/formatters';

const propertyStore  = usePropertyStore();
const receptionStore = useReceptionStore();

const teamProperties = computed(() => {
  return propertyStore.propertiesByTeamId(receptionStore.activeCall.team.uuid);
})
</script>

<style scoped lang="scss">

</style>

