<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div id="root-element" class="grid grid-cols-2" ref="containerRef" :style="{ height: panelHeight }">

    <buy-property />

    <div class="grid grid-cols-2">
      <buy-buildings />
      <do-gambling />
      <call-log class="col-span-2" />
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
const containerRef      = ref(null);
const panelHeight = ref('200px');

// Function to calculate the height
const calculateHeight = () => {
  if (containerRef.value) {
    const rect              = containerRef.value.getBoundingClientRect();
    const availableHeight   = window.innerHeight - rect.top - 20; // 20px bottom margin
    panelHeight.value = `${Math.max(200, availableHeight)}px`; // Minimum 200px
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
#root-element {
  background-color: #c57fd0;
}
</style>
