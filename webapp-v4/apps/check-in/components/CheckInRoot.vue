<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div>
    <Toast />
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
          :online="socketStore.connected"
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
import {onMounted, ref} from 'vue';
import {useCheckInStore} from '../store/CheckInStore';
import {get, last, split} from 'lodash';
import {DateTime} from 'luxon';
import {getReceptionSocket} from '../../reception/lib/ReceptionSocket';
import {useTeamsStore} from '../../../lib/store/TeamsStore';
import {usePropertyStore} from '../../../lib/store/PropertyStore';
import {useGameplayStore} from '../../../lib/store/GameplayStore';
import {useTeamAccountStore} from '../../../lib/store/TeamAccountStore';
import {usePicBucketStore} from '../../../lib/store/PicBucketStore';
import {useRulesStore} from '../../../lib/store/RulesStore';
import {useCronJobStore} from '../../../lib/store/CronJobStore';
import {useTravelLogStore} from '../../../lib/store/TravelLogStore';
import {useSocketStore} from '../../../lib/store/SocketStore';
import {useGeoLocationStore} from '../store/GeoLocationStore';

import Toast from 'primevue/toast';
import {useToast} from 'primevue/usetoast';

const toast = useToast();

const isInitialLoading = ref(true);
const elements         = split(window.location.pathname, '/');
let gameId             = last(elements);

const checkInStore     = useCheckInStore();
const receptionSocket  = getReceptionSocket();
const teamsStore       = useTeamsStore();
const propertyStore    = usePropertyStore();
const gameplayStore    = useGameplayStore();
const teamAccountStore = useTeamAccountStore();
const picBucketStore   = usePicBucketStore();
const rulesStore       = useRulesStore();
const cronJobStore     = useCronJobStore();
const travelLogStore   = useTravelLogStore();
const socketStore      = useSocketStore();
const geoLocationStore = useGeoLocationStore();

onMounted(() => {
  checkInStore.fetchStaticData(gameId)
      .then(async staticData => {
        const start = DateTime.now();
        console.log('Start loading data and socket connection');
        console.log('Init step 1');
        teamsStore.setTeams(staticData.teams);
        gameplayStore.init(staticData.gameplay);
        rulesStore.setRules(staticData.rules);
        console.log('Init step 2');
        await propertyStore.init(gameId, staticData.pricelist, {teamId: staticData?.team?.uuid});
        console.log('Init step 3');
        await propertyStore.update({teamId: staticData?.team?.uuid});
        console.log('Init step 4');
        await teamAccountStore.loadTeamAccountEntries(gameId, staticData?.team?.uuid);
        console.log('Init step 5');
        await picBucketStore.fetchPictures({gameId, teamId: staticData?.team?.uuid});
        console.log('Init step 6');
        geoLocationStore.init();
        console.log('Init step 7');
        await cronJobStore.fetch(gameId);
        console.log('Init step 8');
        await travelLogStore.fetchLog(gameId, staticData?.team?.uuid);
        console.log('Init step 9');
        checkInStore.team = staticData.team;
        console.log('Init step 10');
        receptionSocket.initSocket({
          url:       staticData.socketUrl,
          authToken: staticData.authToken,
          user:      get(staticData, 'user', 'none'),
          gameId:    gameId,
          teamId:    staticData?.team?.uuid
        });
        receptionSocket.socket.on('building-allowed', onBuildingAllowed)
        const end = DateTime.now();
        console.log(`Data finally loaded, needed ${end.diff(start).as('seconds')} seconds`)
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        isInitialLoading.value = false;
      })
})

function onBuildingAllowed() {
  toast.add({severity: 'info', summary: 'Spielrunde abgeschlossen', detail: 'Die Mieten wurden ausbezahlt, es kann wieder gebaut werden!', life: 5000})
}

</script>

<style scoped lang="scss">

</style>
