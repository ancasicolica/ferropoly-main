<!---
  Gameplays, where the user is player
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.11.2025
-->

<template>
  <div v-if="playerGamesAvailable">
    <h1>Meine Spiele</h1>
    <div class="admin-gameplays-grid">
      <player-gameplay-card
          v-for="gp in mainSelectorStore.playerGameplays"
          :key="gp.internal.gameId"
          :gameplay="gp"
      />
    </div>
  </div>
</template>

<script setup>
import {useMainGameSelectorStore} from '../store/MainGameSelectorStore';
import {computed} from 'vue';
import PlayerGameplayCard from './PlayerGameplayCard.vue';

const mainSelectorStore = useMainGameSelectorStore();

const playerGamesAvailable = computed(() => mainSelectorStore.playerGameplays.length > 0);

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
