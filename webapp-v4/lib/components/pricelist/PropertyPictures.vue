<!---
  Pictures of a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.12.2025
-->

<template>
  <div>
    <div
        v-if="!picturesAvailable"
    >
      Diesem Ort sind aktuell keine Bilder zugewiesen.
    </div>
    <div
        v-if="picturesAvailable"
        class="mt-2"
    >
      <div class="flex flex-wrap">
        <div
            v-for="p in visiblePictures"
            :key="p.url"
            class="w-1/2"
        >
          <button type="button" class="picture-thumbnail" :aria-label="`Bild von ${p.teamName} vergrössern`" @click="openPreview(p)">
            <img
                :src="p.url"
                :alt="`Bild von ${p.teamName}`"
                class="w-full"
            />
          </button>
          <div>{{ p.teamName }}, {{ formatGameTime(p.timestamp) }} </div>
        </div>
      </div>
      <PicturePreview
          v-if="previewPicture"
          v-model:visible="previewVisible"
          :src="previewPicture.url"
          :alt="`Bild von ${previewPicture.teamName}`"
      />
    </div>
  </div>
</template>

<script setup>

import {computed, ref} from 'vue';
import {formatGameTime} from '../../../common/lib/formatters';
import PicturePreview from '../pictures/PicturePreview.vue';

const props = defineProps({
  pictures: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const visiblePictures   = computed(() => props.pictures.filter(p => !p.hidden));
const picturesAvailable = computed(() => visiblePictures.value.length > 0);
const previewVisible    = ref(false);
const previewPicture    = ref(null);

const openPreview = picture => {
  previewPicture.value = picture;
  previewVisible.value = true;
};

</script>

<style scoped lang="scss">
.picture-thumbnail {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

</style>
