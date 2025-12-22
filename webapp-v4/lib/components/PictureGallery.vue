<!---
  Gallery with all the pictures. Uses directly the PicBucket store
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div>
    <div v-if="!picturesAvailable">
      Aktuell sind noch keine Bilder vorhanden
    </div>
    <div
        v-else
        class="mt-2 flex flex-row w-full h-full"
    >
      <div
          ref="tableContainer"
          class="flex-1 flex flex-col min-w-0"
          style="height: calc(100vh - 12rem)"
      >
        <div class="h-full min-w-0">
          <ScrollPanel style="height: 100%">
            <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] items-start">

              <div
                  v-for="p in pictures"
                  :key="p._id"
                  class="p-1"
              >
                <gallery-picture
                    :picture="p"
                    @picture-selected="onPictureSelected"
                />
              </div>

            </div>

          </ScrollPanel>
        </div>

      </div>
      <div class="w-[400px] flex-none ml-4">
        <picture-info :picture="selectedPicture" />
      </div>
    </div>

  </div>
</template>

<script setup>

import ScrollPanel from 'primevue/scrollpanel';

import {usePicBucketStore} from '../store/PicBucketStore';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import GalleryPicture from './GalleryPicture.vue';
import PictureInfo from './PictureInfo.vue';

const picBucketStore = usePicBucketStore();

const pictures = computed(() => {
  return picBucketStore.pictures;
})

const picturesAvailable = computed(() => {
  return picBucketStore.pictures && picBucketStore.pictures.length > 0;
})

const selectedPicture = ref(null);
const onPictureSelected = (pic) => {
  console.log('pic selected', pic);
  selectedPicture.value = pic;
}

const tableContainer = ref(null);
let resizeObserver   = null;

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
