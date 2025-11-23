<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div>
    <Panel
        :pt="{header:{style:{'padding-top': '4px','padding-bottom': '4px'}}}"
    >
      <template #header>
        <h3> Häuserbau </h3>
      </template>
      <Button
          label="Überall Häuser bauen"
          severity="secondary"
          @click="buildHouses"
      />
      <p>Einzelne Häuser können unter "Besitz" gebaut werden.</p>
    </Panel>
  </div>
</template>

<script setup>
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import {useReceptionStore} from '../../../store/ReceptionStore';

const receptionStore = useReceptionStore();
const buildHouses = function() {
  receptionStore.buildHouses(receptionStore.activeCall.team.uuid);
};

</script>

<style scoped lang="scss">

</style>
