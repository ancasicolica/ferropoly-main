<!---
  Root element for the Buy Tab
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div
      id="root-element"
      ref="containerRef"
      class="flex gap-2"
      :style="{ height: panelHeight }"
  >
    <div class="w-[600px] min-w-[400px]">
    <buy-property />
    </div>
    <div class="flex flex-col gap-2 grow min-w-[500px]">
      <div class="grid grid-cols-2 gap-2">
        <buy-buildings />
        <do-gambling />
      </div>
      <call-log class="flex-1 " />
    </div>
  </div>
</template>

<script setup>

import BuyProperty from './BuyProperty.vue';
import BuyBuildings from './BuyBuildings.vue';
import DoGambling from './DoGambling.vue';
import CallLog from './CallLog.vue';
import {onMounted, onUnmounted, ref} from 'vue';

// Reference to the container element
const containerRef = ref(null);
const panelHeight  = ref('200px');

// Function to calculate the height
const calculateHeight = () => {
  if (containerRef.value) {
    const rect            = containerRef.value.getBoundingClientRect();
    const availableHeight = window.innerHeight - rect.top - 20; // 20px bottom margin
    panelHeight.value     = `${Math.max(200, availableHeight)}px`; // Minimum 200px
  }
};
// Add resize listener
onMounted(() => {
  calculateHeight();
  window.addEventListener('resize', calculateHeight);
});

// Clean up listener
onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight);
});

</script>

<style scoped lang="scss">

</style>
