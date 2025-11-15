<!---
  A warning banner if the call is active
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 15.11.2025
-->

<template>
  <Message v-if="callActive"
           severity="error"
  >
    Anruf ist aktiv. Bitte unter <a href="#/call">"Anruf behandeln"</a> beenden.
  </Message>
</template>

<script setup>

import Message from 'primevue/message';

import {useReceptionStore} from '../store/ReceptionStore';
import {computed} from 'vue';

const receptionStore = useReceptionStore();

const callActive = computed(() => {
  return receptionStore.teamInCall !== null
})
</script>

<style scoped lang="scss">
a {
  color: inherit;
}
</style>
