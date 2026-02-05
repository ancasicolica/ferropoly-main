<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <!-- eslint-disable vue/no-v-html -->
    <div
        class="rules-container"
        v-html="rulesStore.rules.released"
    />
  </div>
</template>

<script setup>
import {useRulesStore} from '../../../../lib/store/RulesStore';

const rulesStore = useRulesStore();

</script>

<style scoped lang="scss">
.rules-container {
  width: 90%;
  margin: 0 auto;
}
</style>
