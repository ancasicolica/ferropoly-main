<!---
  Everything for an active call
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 15.11.2025
-->

<template>
  <div>
    <h1> {{ teamName }}

      <span
          id="color-tag"
          :style="cssVars"
      > &#9608;&#9608;
      </span>
      <Button
          label="Anruf beenden"
          severity="info"
          rounded
          aria-label="End call"
          class="end-call-button"
          @click="handleEndCall"
      />
    </h1>
    <Tabs value="0">
      <TabList>
        <Tab value="0">Kaufen</Tab>
        <Tab value="1">Besitz</Tab>
        <Tab value="2">Bilder</Tab>
        <Tab value="3">Log</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <p>Kaufi kaufi</p>
        </TabPanel>
        <TabPanel value="1">
          <p>Was hab i?</p>
        </TabPanel>
        <TabPanel value="2">
          <p>Pictures</p>
        </TabPanel>
        <TabPanel value="3">
          <p>Log</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import {useReceptionStore} from '../../store/ReceptionStore';
import {computed} from 'vue';

const receptionStore = useReceptionStore();

const teamName = computed(()=> receptionStore.teamInCall.name);

const cssVars = computed(() => {
  return {'--team-color': receptionStore.teamInCall.color};
})

// Handler for ending the call
const handleEndCall = () => {
  receptionStore.teamInCall = null;
}


</script>

<style scoped lang="scss">
#color-tag {
  color: var(--team-color);
  position: absolute;
  right: 25px;
}

.end-call-button {
  position: absolute;
  right: 90px;
}
</style>
