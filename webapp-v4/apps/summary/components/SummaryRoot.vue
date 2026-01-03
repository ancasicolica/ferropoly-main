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
        <ferro-jumbotron
            v-if="!gameplayStore.summaryPublic"
            title="Noch etwas zu früh..."
            info="Die Spieldaten sind ab Mitternacht öffentlich, schau doch dann nochmals vorbei!"
        />
        <router-view v-else />
      </div>
    </div>
  </div>
</template>

<script setup>

import ProgressSpinner from 'primevue/progressspinner';
import MenuBar from '../../../common/components/MenuBar.vue';
import {ref} from 'vue';
import {useSummaryStore} from '../store/SummaryStore';
import {useChancelleryStore} from '../../../lib/store/ChancelleryStore';
import {useTeamsStore} from '../../../lib/store/TeamsStore';
import {usePropertyStore} from '../../../lib/store/PropertyStore';
import {useGameplayStore} from '../../../lib/store/GameplayStore';
import {useTeamAccountStore} from '../../../lib/store/TeamAccountStore';
import {usePicBucketStore} from '../../../lib/store/PicBucketStore';
import {last, split} from 'lodash';
import {DateTime} from 'luxon';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';

const elements = split(window.location.pathname, '/');
let gameId     = last(elements);


const summaryStore     = useSummaryStore();
const isInitialLoading = ref(true);

const chancelleryStore = useChancelleryStore();
const teamsStore       = useTeamsStore();
const propertyStore    = usePropertyStore();
const gameplayStore    = useGameplayStore();
const teamAccountStore = useTeamAccountStore();
const picBucketStore   = usePicBucketStore();

summaryStore.fetchData(gameId)
    .then(async staticData => {
      const start = DateTime.now();
      console.log('Init step 1');
      teamsStore.setTeams(staticData.teams);
      gameplayStore.init(staticData.gameplay);
      console.log('Init step 2');
      await propertyStore.init(gameId, staticData.properties);
      console.log('Init step 3');
      await propertyStore.updateTransactions('all', staticData.propertyAccount);
      console.log('Init step 4');
      teamAccountStore.bookTeamAccountEntries(staticData.accountStatement?.accountData);
      console.log('Init step 5');
      picBucketStore.setPictures(staticData.picBucket);
      console.log('Init step 6');
      await chancelleryStore.setEntries(staticData.chancellery)
      isInitialLoading.value = false;
      const end              = DateTime.now();
      console.log(`Data finally loaded, needed ${end.diff(start).as('seconds')} seconds`)

    })
    .catch(err => {
      console.error('Oh no...', err);
    })
</script>

<style scoped lang="scss">

</style>
