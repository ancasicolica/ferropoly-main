<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <!-- eslint-disable vue/no-v-html -->
    <div
        class="rules-container"
        v-html="rulesStore.rules.released"
    />
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import {useRulesStore} from '../../../../lib/store/RulesStore';
const rulesStore = useRulesStore();

</script>

<style scoped lang="scss">
.rules-container {
  width: 80%;
  margin: 0 auto;
}
</style>
