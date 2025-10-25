<!---
  Jumbotron like control
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <Card class="jumbotron-style">
    <template #title>
      <div class="title">{{ title }}</div>
    </template>
    <template #content>
      <div class="info">{{ info }}</div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';

defineProps({
  title: {
    type:    String,
    default: 'Welcome to Ferropoly!'
  },
  info:  {
    type:    String,
    default: ''
  }
});

</script>

<style scoped lang="scss">

.title {
  font-weight: bold;
  font-size: xxx-large;
  color: black;
}
.info {
  font-size: x-large;
}
.jumbotron-style {
  background-color: #e9ecef;
  padding: 2rem 1rem;
  border-radius: 0.3rem;
}
</style>
