<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 13.12.2025
-->

<template>
  <div>
    <div
        ref="tableContainer"
        class="flex flex-row w-full h-full"
    >
      <div class="flex flex-1 gap-2 min-h-0">
        <div class="basis-1/2 ">
          <team-properties />
        </div>

        <div class="basis-1/2 ">
          <team-account class="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TeamProperties from './TeamProperties.vue';
import TeamAccount from './TeamAccount.vue';

import {onBeforeUnmount, onMounted, ref} from 'vue';

let resizeObserver   = null;
const tableContainer = ref(null);

// Funktion zur Berechnung der verbleibenden Höhe
const adjustHeight = () => {
  if (tableContainer.value) {
    const rect                        = tableContainer.value.getBoundingClientRect();
    // Berechnet den Platz vom oberen Rand des Elements bis zum unteren Rand des Fensters
    const remainingHeight             = window.innerHeight - rect.top - 20;
    // Setzt die Höhe (verhindert negative Werte)
    tableContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
  }
};
onMounted(() => {
  // Initiale Berechnung
  adjustHeight();

  // Bei Änderung der Fenstergröße neu berechnen
  window.addEventListener('resize', adjustHeight);

  // ResizeObserver überwacht nun den Body, um Layout-Verschiebungen
  // (z.B. Banner wird größer/kleiner) zu erkennen.
  resizeObserver = new ResizeObserver(() => {
    adjustHeight();
  });

  resizeObserver.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustHeight);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

</script>

<style scoped lang="scss">

</style>
