<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <div v-html="infoStore.rules.released" />
    <Divider />
    <div>Stand der Regeln: {{ rulesDate }}</div>
  </div>

</template>

<script setup>
import {useInfoStore} from '../store/InfoStore';
import {formatDateTime} from '../../../common/lib/formatters';
import {computed} from 'vue';

import Divider from 'primevue/divider';

const infoStore = useInfoStore();

const rulesDate = computed(() => formatDateTime(infoStore.rulesDate));
</script>

<style scoped lang="scss">

</style>
