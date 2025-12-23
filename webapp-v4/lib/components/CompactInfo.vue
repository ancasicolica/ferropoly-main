<!---
A compact info with a title and a text on the following line
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 23.12.2025
-->

<template>
  <div class="mb-3">
    <div class="compact-title mb-1">{{ title }}</div>
    <slot class="entry"></slot>
  </div>
</template>

<script setup>

const props = defineProps({
  title: {
    type:     String,
    required: true,
    default:  () => ''
  }
});

</script>

<style scoped lang="scss">
.compact-title {
  background-color: #c6c9c9;
  padding-left: 4px;
}

.entry {
  border-color: rgba(169, 168, 196, 0.99);
  border-bottom: 4px;
  padding-left: 3px;
}
</style>
