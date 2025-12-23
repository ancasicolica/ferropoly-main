<!---
  One Picture in the gallery
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div :class="['picture-container', { 'selected': selected }]">
    <Image
        :src="picture.url"
        width="100%"
        preview
        @show="onClick"
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
  picture:  {
    type:     Object,
    required: true,
    default:  () => {
    }
  },
  selected: {
    type:    Boolean,
    default: false
  }
});

const emit = defineEmits(['picture-selected']);

const onClick = () => {
  emit('picture-selected', props.picture);
};

</script>

<style scoped lang="scss">
.picture-container {
  background-color: white;
  transition: background-color 0.3s ease;

  &.selected {
    background-color: rgba(194, 184, 184, 0.99); // dark gray
    //color: white; // optional: change text color for better contrast
  }
}

.title {
  font-weight: bold;
  color: #3b82f6; // blue color
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: #2563eb; // darker blue on hover
  }
}

.location {
  font-style: italic;
}
</style>
