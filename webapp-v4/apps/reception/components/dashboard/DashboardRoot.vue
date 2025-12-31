<!---
  The dashboard of the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <h1>Übersicht</h1>
    <div class="flex  gap-4">
      <div class="basis-128">
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
      <div class="basis-64">
        <ferropoly-clock />
      </div>
    </div>
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import FerroCard from '../../../../common/components/FerroCard.vue';
import RankingList from '../../../../lib/components/RankingList.vue';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {computed} from 'vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import FerropolyClock from './FerropolyClock.vue';

const receptionStore = useReceptionStore();
const downloadUrl    = computed(() => {
  return `/download/rankinglist/${receptionStore.gameId}`;
})

</script>

<style scoped lang="scss">

</style>
