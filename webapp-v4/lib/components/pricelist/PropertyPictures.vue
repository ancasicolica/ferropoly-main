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
          <div v-if="!p.hidden">
            <Image
                :src="p.url"
                width="100%"
                preview
            />
            <div>{{ p.teamName }}, {{ formatGameTime(p.timestamp) }} </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import Image from 'primevue/image';
import {computed} from 'vue';
import {formatGameTime} from '../../../common/lib/formatters';

const props = defineProps({
  pictures: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const picturesAvailable = computed(() => {
  let picNb = 0;
  for (const p of props.pictures) {
    if (!p.hidden) {
      picNb++;
    }
  }
  return (props.pictures && props.pictures.length > 0 && picNb > 0);
});

</script>

<style scoped lang="scss">

</style>
