<!---
  Root element for the join App
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <menu-bar
        :elements="joinStore.menuBarElements"
        show-user-box
        help-url="https://www.ferropoly.ch"
        help-text="Infos zum Ferropoly"
    />
    <div class="ferropoly-container">
      <FatalApiError :error="joinStore.apiError" />
      <div
          v-if="!joinStore.apiError"
          class="grid grid-cols-2 gap-4"
      >
        <div class="col-span-2 md:col-span-1">
          <game-info />
        </div>
        <div class="col-span-2 md:col-span-1">
          <div v-if="joinStore.joiningPossible">
            <join-form />
            <join-my-registration />
          </div>
          <div v-else>
            <ferro-jumbotron
                title="Den Zug verpasst..."
                info="Der Anmeldeschluss ist vorbei, neue Anmeldungen oder Anpassungen der Anmeldung sind nicht mehr möglich."
            />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import FatalApiError from '../../../lib/components/FatalApiError.vue';
import GameInfo from './GameInfo.vue';
import JoinForm from './JoinForm.vue';
import {onMounted} from 'vue';
import {last, split} from 'lodash';
import {useJoinStore} from '../store/joinStore';
import JoinMyRegistration from './JoinMyRegistration.vue';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';

const joinStore = useJoinStore();

onMounted(() => {
  const elements = split(window.location.pathname, '/');
  let gameId     = last(elements);
  joinStore.fetchData(gameId).then(() => {
    console.log('data loaded');
  });
})
</script>

<style scoped lang="scss">

</style>
