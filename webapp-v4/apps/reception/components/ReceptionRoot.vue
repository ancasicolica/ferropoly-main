<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.11.2025
-->

<template>
  <div>
    <!-- The dialog for warnings using a too low screen resolution -->
    <Dialog
        v-model:visible="dialogVisible"
        modal
    >
      <template #container="{ closeCallback }">
        <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
          <div
              class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
          >
            <FontAwesomeIcon
                id="confirm-icon"
                :icon="faDisplay"
            />
          </div>
          <span class="font-bold text-2xl block mb-2 mt-6">Houston, we have a problem...</span>
          <p class="mb-0">Die Auflösung deines Bildschirms ist zu klein - die Spielauswertung ist ausgelegt für
            Bildschirme mit
            &#8805; 1024 Pixel, mit dem Handy lässt sich das Spiel sehr schlecht administrieren.</p>
          <div class="flex items-center gap-2 mt-6">
            <Button
                label="Verstanden, ich mach trotzdem weiter"
                class="w-auto"
                @click="closeCallback"
            />
          </div>

        </div>
      </template>
    </Dialog>
    <!-- here starts the app -->
    <menu-bar
        :elements="receptionStore.menuBarElements"
        show-online-status
        :online="receptionStore.socketConnected"
        help-url="/about"
    />
    <div class="ferropoly-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import {useReceptionStore} from '../store/ReceptionStore';
import {last, split, get} from 'lodash';
import {getReceptionSocket} from '../lib/ReceptionSocket';
import {useTeamsStore} from '../../../lib/store/TeamsStore';
import {usePropertyStore} from '../../../lib/store/PropertyStore';
import {onMounted, ref} from 'vue';
import Dialog from 'primevue/dialog';
import {faDisplay} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Button from 'primevue/button';
import {useGameplayStore} from '../../../lib/store/GameplayStore';
import {useTeamAccountStore} from '../../../lib/store/TeamAccountStore';

const receptionStore  = useReceptionStore();
const receptionSocket = getReceptionSocket();
const teamsStore      = useTeamsStore();
const propertyStore   = usePropertyStore();
const gameplayStore   = useGameplayStore();
const teamAccountStore = useTeamAccountStore();

const elements = split(window.location.pathname, '/');
let gameId     = last(elements);

receptionStore.fetchStaticData(gameId)
    .then(async staticData => {
      console.log('data loaded');
      receptionSocket.initSocket({
        url:       staticData.socketUrl,
        authToken: staticData.authToken,
        user:      get(staticData, 'user', 'none'),
        gameId:    gameId
      });
      teamsStore.setTeams(staticData.teams);
      gameplayStore.init(staticData.gameplay);
      await propertyStore.init(gameId, staticData.pricelist);
      await teamAccountStore.loadTeamAccountEntries(gameId);
    })
    .catch(err => {
      console.error(err);
    });

const dialogVisible = ref(false);

onMounted(() => {
  console.log('window.screen.width', window.screen.width);
  if (window.screen.width < 1024) {
    dialogVisible.value = true;
  }
})

</script>

<style scoped lang="scss">
#confirm-icon {
  font-size: xxx-large;
}
</style>
