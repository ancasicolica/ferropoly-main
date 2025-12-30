<!---
  The root element for the reception accounting
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <accounting-tabs />
  </div>
</template>

<script setup>
import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import AccountingTabs from '../../../../lib/components/teamAccount/AccountingTabs.vue';

</script>

<style scoped lang="scss">

</style>
