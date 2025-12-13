<!---
  The root element for the reception accounting
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <Tabs
        v-model:value="accountingTeamId"
        :value="teamsStore.teams[0]?.uuid"
        scrollable
    >
      <TabList>
        <Tab
            v-for="team in teamsStore.teams"
            :key="team.uuid"
            :value="team.uuid"
        >
          {{ team.name }}
          <span
              id="color-tag"
              :style="cssVars(team.color)"
          > &#9608;
          </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
            v-for="team in teamsStore.teams"
            :key="team.uuid"
            :value="team.uuid"
        >
          <team-account
              :team-id="team.uuid"
              :paginator-enabled="receptionStore.paginationEnabled"
              :sort-order="sortOrder"
              @update:sort-order="onSortOrderUpdated"
          />
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
import TeamAccount from './TeamAccount.vue';
import {computed, ref} from 'vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import {getItem, setInt} from '../../../../common/lib/localStorage';

const teamsStore       = useTeamsStore();
const receptionStore   = useReceptionStore();
const sortOrder        = ref(getItem('accountingSortOrder', 1))

const cssVars = function (color) {
  return {'--team-color': color};
};

const onSortOrderUpdated = (_sortOrder) => {
  sortOrder.value = _sortOrder;
  setInt('accountingSortOrder', sortOrder.value);
}

const accountingTeamId = computed({
  set: (newValue) => {
    receptionStore.accountingTeamId = newValue;
  },
  get: () => {
    if (!receptionStore.accountingTeamId) {
      return teamsStore.teams[0]?.uuid;
    }
    return receptionStore.accountingTeamId;
  }
})
</script>

<style scoped lang="scss">
#color-tag {
  color: var(--team-color);
}

</style>
