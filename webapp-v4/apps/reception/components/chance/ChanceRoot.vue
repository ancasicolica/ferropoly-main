<!---
  Chancellery view
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <chance-info />
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import ChanceInfo from '../../../../lib/components/chance/ChanceInfo.vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import {onMounted} from 'vue';
const receptionStore = useReceptionStore();
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/chancellery/')
});
</script>

<style scoped lang="scss">

</style>
