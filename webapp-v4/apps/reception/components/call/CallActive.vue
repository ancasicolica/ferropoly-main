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
          aria-label="End call"
          class="end-call-button"
          @click="handleEndCall"
      />
    </h1>
    <Tabs value="0">
      <TabList>
        <Tab value="0">Kaufen</Tab>
        <Tab value="1">Besitz</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <buy-root />
        </TabPanel>
        <TabPanel value="1">
          <property-root></property-root>
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
import BuyRoot from './buy-tab/BuyRoot.vue';
import PropertyRoot from './property-tab/PropertyRoot.vue';

const receptionStore = useReceptionStore();

const teamName = computed(()=> receptionStore.activeCall.team.name);

const cssVars = computed(() => {
  return {'--team-color': receptionStore.activeCall.team.color};
})

// Handler for ending the call
const handleEndCall = () => {
  receptionStore.finishCall();
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
