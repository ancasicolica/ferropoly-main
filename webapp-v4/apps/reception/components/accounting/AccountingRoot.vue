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
import {useReceptionStore} from '../../store/ReceptionStore';
import {onMounted} from 'vue';
const receptionStore = useReceptionStore();
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/accounting/')
});
</script>

<style scoped lang="scss">

</style>
