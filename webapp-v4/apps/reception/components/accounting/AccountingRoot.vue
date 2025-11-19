<!---
  The root element for the reception accounting
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <Tabs :value="teamsStore.teams[0].uuid" scrollable>
      <TabList>
        <Tab v-for="team in teamsStore.teams" :key="team.uuid" :value="team.uuid">
          {{ team.name }}
          <span
              id="color-tag"
              :style="cssVars(team.color)"
          > &#9608;
          </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="team in teamsStore.teams" :key="team.uuid" :value="team.uuid">
          <p class="m-0">{{ team.name }}</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';

const teamsStore = useTeamsStore();

const cssVars = function(color) {
  return {'--team-color': color};
};

</script>

<style scoped lang="scss">
#color-tag {
  color: var(--team-color);
}

</style>
