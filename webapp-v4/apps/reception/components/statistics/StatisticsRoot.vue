<!---
  The statistics page
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />


    <Tabs :value="statisticStore.activeTab">
      <TabList>
        <Tab value="0">Vermögen</Tab>
        <Tab value="1">Erfolgsrechnung</Tab>
        <Tab value="2">Einkommen</Tab>
        <Tab value="3">Einkommen pro Runde</Tab>
        <Tab value="4">Vermögensverlauf</Tab>
      </TabList>
      <TabPanels :key="activeTab">
        <TabPanel value="0">
          <FortuneStatistics />
        </TabPanel>
        <TabPanel value="1">
          <IncomeStatement />
        </TabPanel>
        <TabPanel value="2">
          <IncomeStatistics />
        </TabPanel>
        <TabPanel value="3">
          <RoundStatistics />
        </TabPanel>
        <TabPanel value="4">
          <FortuneHistory />
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
import FortuneHistory from './FortuneHistory.vue';
import FortuneStatistics from './FortuneStatistics.vue';
import IncomeStatistics from './IncomeStatistics.vue';
import IncomeStatement from './IncomeStatement.vue';
import RoundStatistics from './RoundStatistics.vue';
import {useStatisticStore} from '../../../../lib/store/StatisticStore';

const statisticStore = useStatisticStore();


</script>

<style scoped lang="scss">

</style>
