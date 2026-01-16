<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div>
    <div
        v-if="isInitialLoading"
        class="flex flex-col items-center justify-center h-screen bg-surface-50 dark:bg-surface-950"
    >
      <ProgressSpinner />
      <span class="mt-4 font-medium text-lg">Lade Spieldaten...</span>
    </div>
    <div v-else>
      <menu-bar
          :elements="checkInStore.menuBarElements"
          show-online-status
          :online="checkInStore.socketConnected"
          help-url="/about"
      />
      <div class="ferropoly-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import {ref} from 'vue';
import {useCheckInStore} from '../store/CheckInStore';

const isInitialLoading = ref(false);

const checkInStore = useCheckInStore();

</script>

<style scoped lang="scss">

</style>
