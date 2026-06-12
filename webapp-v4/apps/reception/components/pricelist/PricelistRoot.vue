<!---
  The panel for the pricelist
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <property-info />
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import PropertyInfo from '../../../../lib/components/pricelist/propertyInfo.vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import {onMounted} from 'vue';

const receptionStore = useReceptionStore();
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/pricelist/')
});
</script>

<style scoped lang="scss">

</style>
