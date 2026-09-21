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
import {onMounted, onUnmounted} from 'vue';
import {useChancelleryStore} from '../../../../lib/store/ChancelleryStore';
import {getReceptionSocket} from '../../lib/ReceptionSocket';

const receptionStore = useReceptionStore();
const chancelleryStore = useChancelleryStore();

const eventHandler = async function () {
  await chancelleryStore.loadChancelleryEntries(receptionStore.gameId);
}

/**
 * When mounted, add the event handler for updating the chancellery
 */
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/chancellery/');
  chancelleryStore.loadChancelleryEntries(receptionStore.gameId);
  getReceptionSocket().socket.on('chancellery-update', eventHandler);
});

/**
 * When unmounted, remove the listener for chancellery updates
 */
onUnmounted(()=> {
  getReceptionSocket().socket.off('chancellery-update', eventHandler);
})
</script>

<style scoped lang="scss">

</style>
