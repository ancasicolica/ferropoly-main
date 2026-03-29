<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <div v-if="rulesNotReadyYet">
      <ferro-jumbotron
          :title="infoStore.gameInfo.gameName"
          info="Die Spielregeln für dieses Spiel sind noch nicht freigegeben. Komme später wieder vorbei!"
      />
    </div>
    <div v-else>
      <div v-html="infoStore.rules.released" />
      <Divider />
      <div>Stand der Regeln: {{ rulesDate }}</div>
    </div>
  </div>

</template>

<script setup>
import {useInfoStore} from '../store/InfoStore';
import {formatDateTime} from '../../../common/lib/formatters';
import {computed} from 'vue';

import Divider from 'primevue/divider';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';

const infoStore = useInfoStore();

const rulesDate = computed(() => formatDateTime(infoStore.rulesDate));

const rulesNotReadyYet = computed( ()=> {
  return infoStore.rules.released === '' || infoStore.rules.released === null;
})
</script>

<style scoped lang="scss">

</style>
