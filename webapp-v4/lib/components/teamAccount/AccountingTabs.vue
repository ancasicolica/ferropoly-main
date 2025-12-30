<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.12.2025
-->

<template>
  <div>
    <Tabs
        v-model:value="accountingTeamId"
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
              :sort-order="sortOrder"
              @update:sort-order="onSortOrderUpdated"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>

import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import Tabs from 'primevue/tabs';
import TabPanels from 'primevue/tabpanels';
import TeamAccount from './TeamAccount.vue';
import TabPanel from 'primevue/tabpanel';
import {getItem, setInt, setString} from '../../../common/lib/sessionStorage';
import {computed, ref} from 'vue';
import {useTeamsStore} from '../../store/TeamsStore';

const teamsStore = useTeamsStore();

const sortOrder         = ref(getItem('accountingSortOrder', 1))
const _accountingTeamId = ref(getItem('accountingTeamId', null));

const cssVars = function (color) {
  return {'--team-color': color};
};

const onSortOrderUpdated = (_sortOrder) => {
  sortOrder.value = _sortOrder;
  setInt('accountingSortOrder', sortOrder.value);
}

const accountingTeamId = computed({
  set: (newValue) => {
    _accountingTeamId.value = newValue;
    setString('accountingTeamId', newValue)
  },
  get: () => {
    if (!_accountingTeamId.value) {
      return teamsStore.teams[0]?.uuid;
    }
    return _accountingTeamId.value;
  }
})
</script>

<style scoped lang="scss">
#color-tag {
  color: var(--team-color);
}

</style>
