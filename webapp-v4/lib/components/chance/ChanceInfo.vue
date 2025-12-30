<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.12.2025
-->

<template>
  <div>
    <h1>Chance/Kanzlei</h1>
    <div
        ref="tableContainer"
        class="flex flex-row w-full h-full"
        :style="{height: containerHeight}"
    >
      <div class="flex flex-1 gap-4 min-h-0 overflow-hidden">
        <div class="basis-100 shrink-0 min-h-0 overflow-hidden">
          <chance-summary />
        </div>

        <div class="flex-1 min-w-0 min-h-0">
          <chance-account class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import ChanceAccount from './ChanceAccount.vue';
import ChanceSummary from './ChanceSummary.vue';
import {useContainerResize} from '../../composables/useContainerResize';
import {ref} from 'vue';

// SIZE HANDLING
const tableContainer    = ref(null);
const {containerHeight} = useContainerResize(tableContainer);
/// END SIZE HANDLING

</script>

<style scoped lang="scss">

</style>
