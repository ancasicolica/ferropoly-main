<!---
  The log for a call, ell entries
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div>
    <Panel header="Anruf-Log">
      <scroll-panel
          ref="containerRef"
          :style="{ height: panelHeight }"
      >
        <call-log-entry
            v-for="entry in receptionStore.activeCall.messageLog"
            :key="entry.timestamp"
            :entry="entry"
        />
      </scroll-panel>
    </Panel>
  </div>
</template>

<script setup>
import Panel from 'primevue/panel';
import ScrollPanel from 'primevue/scrollpanel';
import {onMounted, onUnmounted, ref} from 'vue';
import CallLogEntry from './CallLogEntry.vue';
import {useReceptionStore} from '../../../store/ReceptionStore';

const receptionStore = useReceptionStore();

// Reference to the container element
const containerRef = ref(null);
const panelHeight  = ref('200px');

// Function to calculate the height
const calculateHeight = () => {
  if (containerRef.value && containerRef.value.$el) {
    const rect            = containerRef.value.$el.getBoundingClientRect();
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
