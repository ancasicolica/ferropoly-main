<!---
  The statistics page
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />


    <Tabs :value="activeTab">
      <TabList>
        <Tab value="0">Vermögen</Tab>
        <Tab value="1">Erfolgsrechnung</Tab>
        <Tab value="2">Einkommen</Tab>
        <Tab value="3">Vermögensverlauf</Tab>
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
          <FortuneHistory />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>

</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import { ref } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import FortuneHistory from './FortuneHistory.vue';
import FortuneStatistics from './FortuneStatistics.vue';
import IncomeStatistics from './IncomeStatistics.vue';
import IncomeStatement from './IncomeStatement.vue';

const activeTab = ref("0");
</script>

<style scoped lang="scss">

</style>
