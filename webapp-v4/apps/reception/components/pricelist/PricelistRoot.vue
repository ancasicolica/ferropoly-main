<!---
  The panel for the pricelist
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />

    <div
        ref="tableContainer"
          style=" background-color: red"
        class="flex flex-row w-full h-full"
    >
      <div class="flex-6 min-w-0">
        <game-pricelist :properties="properties"/>
      </div>
      <div class="flex-4">
      xxx
    </div>


    </div>

  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import GamePricelist from '../../../../lib/components/GamePricelist.vue';

import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';

const propertyStore = usePropertyStore();

const properties = computed(() => propertyStore.pricelist);
let resizeObserver = null;
const tableContainer = ref(null);

// Funktion zur Berechnung der verbleibenden Höhe
const adjustHeight = () => {
  if (tableContainer.value) {
    const rect = tableContainer.value.getBoundingClientRect();
    // Berechnet den Platz vom oberen Rand des Elements bis zum unteren Rand des Fensters
    const remainingHeight = window.innerHeight - rect.top;
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
