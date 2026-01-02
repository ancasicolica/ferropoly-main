<!---
  Info about a game in the past
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div>
    <h1>Spielzusammenfassung "{{ gamename }}"</h1>
    <div class="flex flex-col md:flex-row w-full gap-2">
      <div class="w-full md:w-1/2">
        <game-summary />
      </div>
      <div class="w-full md:w-1/2">
        <FerroCard
            title="Rangliste"
            condensed
        >
          <template #controls>
            <a :href="downloadUrl">
              <FontAwesomeIcon :icon="faDownload" />
            </a>
          </template>

          <RankingList />
        </FerroCard>
      </div>
    </div>
  </div>
</template>

<script setup>

import GameSummary from './GameSummary.vue';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import {computed} from 'vue';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import RankingList from '../../../../lib/components/RankingList.vue';
import FerroCard from '../../../../common/components/FerroCard.vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

const gameplayStore = useGameplayStore();

const gamename = computed(()=> {
  return gameplayStore.gameplay.gamename;
})

const downloadUrl    = computed(() => {
  return `/download/rankinglist/${gameplayStore.gameplay.internal.gameId}`;
})
</script>

<style scoped lang="scss">

</style>
