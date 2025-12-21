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
        class="flex flex-row w-full h-full"
    >
      <div class="flex-6 min-w-0">
        <ScrollPanel style="height: 100%">
          <game-pricelist
              :properties="properties"
              :pictures="pictures"
              :paginator-enabled="receptionStore.paginationEnabled"
              @property-selected="onPropertySelected"
          />
        </ScrollPanel>
      </div>
      <div class="flex-4">
        <property-info-card
            :property="currentProperty"
            :pictures="propertyPictures"
        />
      </div>
    </div>
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import GamePricelist from '../../../../lib/components/GamePricelist.vue';
import ScrollPanel from 'primevue/scrollpanel';

import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import PropertyInfoCard from '../../../../lib/components/PropertyInfoCard.vue';
import {usePicBucketStore} from '../../../../lib/store/PicBucketStore';

const propertyStore  = usePropertyStore();
const receptionStore = useReceptionStore();
const picBucketStore = usePicBucketStore();

const properties      = computed(() => propertyStore.pricelist);
let resizeObserver    = null;
const tableContainer  = ref(null);
const currentProperty = ref(null);

// Funktion zur Berechnung der verbleibenden Höhe
const adjustHeight = () => {
  if (tableContainer.value) {
    const rect                        = tableContainer.value.getBoundingClientRect();
    // Berechnet den Platz vom oberen Rand des Elements bis zum unteren Rand des Fensters
    const remainingHeight             = window.innerHeight - rect.top;
    // Setzt die Höhe (verhindert negative Werte)
    tableContainer.value.style.height = `${Math.max(0, remainingHeight)}px`;
  }
};

const onPropertySelected = function (property) {
  currentProperty.value = property;
}

const pictures = computed(() => {
  return picBucketStore.pictures;
})

const propertyPictures = computed(() => {
  if (!currentProperty.value) {
    return [];
  }
  return picBucketStore.getPicturesForProperty(currentProperty.value.uuid);
})

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
