<!---
  One Picture in the gallery
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div>
    <Image
        :src="picture.url"
        width="100%"
        preview
    />
    <div
        class="title"
        @click="onClick"
    >
      {{ formatGameTime(picture.timestamp) }} {{ picture.teamName }}
    </div>
    <div class="location">{{ picture.locationName }}</div>
  </div>
</template>

<script setup>

import Image from 'primevue/image';
import {formatGameTime} from '../../common/lib/formatters';

const props = defineProps({
  picture: {
    type:     Object,
    required: true,
    default:  () => {
    }
  }
});

const emit = defineEmits(['picture-selected']);

const onClick = () => {
  emit('picture-selected', props.picture);
};

</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
  cursor: pointer;
}

.location {
  font-style: italic;
}
</style>
