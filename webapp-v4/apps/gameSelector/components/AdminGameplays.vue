<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.11.2025
-->

<template>
  <div v-if="adminGamesAvailable">
    <h1>Meine Spiele als Admin</h1>
    <div class="admin-gameplays-grid">
      <admin-gameplay-card
          v-for="gp in mainSelectorStore.adminGameplays"
          :key="gp.internal.gameId"
          :gameplay="gp"
      />
    </div>
  </div>
</template>

<script setup>
import {useMainGameSelectorStore} from '../store/MainGameSelectorStore';
import {computed} from 'vue';
import AdminGameplayCard from './AdminGameplayCard.vue';

const mainSelectorStore = useMainGameSelectorStore();

const adminGamesAvailable = computed(() => mainSelectorStore.adminGameplays.length > 0);


</script>

<style scoped lang="scss">
.admin-gameplays-grid {
  display: grid;
  gap: 1rem;

  // Small screens: 1 column
  grid-template-columns: 1fr;

  // Medium screens: 2 columns (e.g., tablets)
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Large screens: 3 columns (e.g., desktops)
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
