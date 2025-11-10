<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.11.2025
-->

<template>
  <div>
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
import {last, split,get} from 'lodash';
import {getReceptionSocket} from '../lib/ReceptionSocket';
import {useTeamsStore} from '../../../lib/store/Teams';
import {usePropertyStore} from '../../../lib/store/PropertyStore';

const receptionStore = useReceptionStore();
const receptionSocket = getReceptionSocket();
const teamsStore = useTeamsStore();
const propertyStore = usePropertyStore();

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
      await propertyStore.init(staticData.pricelist);
    })
    .catch(err => {
      console.error(err);
    });

</script>

<style scoped lang="scss">

</style>
