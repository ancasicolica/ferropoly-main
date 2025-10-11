<!---
  This component displays a "fatal" API error: one which can not be cured by software, no
  further actions can be taken

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div v-if="props.error">
    <Message severity="error">
      <h3 v-if="title">
        {{ title }}
      </h3>
      {{ message }}
    </Message>
  </div>
</template>

<script setup>

import Message from 'primevue/message';
import {computed, defineProps} from 'vue';

const props = defineProps({
  error: {
    type:    Object,
    default: () => null
  },
  title: {
    type:    String,
    default: () => 'Fehler bei Zugriff auf den Server'
  }
})

const message = computed(() => props.error.message)
const title   = computed(() => props.title)
</script>

<style scoped lang="scss">

</style>
