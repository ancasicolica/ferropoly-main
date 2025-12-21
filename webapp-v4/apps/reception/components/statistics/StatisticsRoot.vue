<!---
  The statistics page
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />


    <Tabs value="0">
      <TabList>
        <Tab value="0">Vermögen</Tab>
        <Tab value="1">Vermögensverlauf</Tab>
        <Tab value="2">Einkommen</Tab>
        <Tab value="3">Orte</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <FortuneStatistics />
        </TabPanel>
        <TabPanel value="1">
          <FortuneHistory />
        </TabPanel>
        <TabPanel value="2">
          <IncomeStatistics />
        </TabPanel>
        <TabPanel value="3">
          <PropertyStatistics />
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
import PropertyStatistics from './PropertyStatistics.vue';

</script>

<style scoped lang="scss">

</style>
