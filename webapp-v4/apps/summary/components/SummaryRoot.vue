<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div>
    <!-- here starts the app -->
    <div
        v-if="isInitialLoading"
        class="flex flex-col items-center justify-center h-screen bg-surface-50 dark:bg-surface-950"
    >
      <ProgressSpinner />
      <span class="mt-4 font-medium text-lg">Lade Spieldaten...</span>
    </div>
    <div v-else>
      <menu-bar
          :elements="summaryStore.menuBarElements"
      />
      <div class="ferropoly-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>

import ProgressSpinner from 'primevue/progressspinner';
import MenuBar from '../../../common/components/MenuBar.vue';
import {ref} from 'vue';
import {useSummaryStore} from '../store/SummaryStore';

const summaryStore     = useSummaryStore();
const isInitialLoading = ref(false);

</script>

<style scoped lang="scss">

</style>
