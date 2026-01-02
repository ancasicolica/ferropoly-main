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
            v-for="p in pictures"
            :key="p.url"
            class="w-1/2"
        >
          <Image
              :src="p.url"
              width="100%"
              preview
          />
          <div>{{ p.filename }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import Image from 'primevue/image';
import {computed} from 'vue';

const props = defineProps({
  pictures: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const picturesAvailable = computed(() => {
  return (props.pictures && props.pictures.length > 0);
});

</script>

<style scoped lang="scss">

</style>
