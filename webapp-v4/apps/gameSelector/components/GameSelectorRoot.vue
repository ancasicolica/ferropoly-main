<!---
  Game selector for the main game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <menu-bar
        :elements="mainSelectorStore.menuBarElements"
        show-user-box
        help-url="/about"
        help-text="Infos / Kontakt"
    />
    <welcome-bar :user-name="mainSelectorStore.userName" />
    <div class="ferropoly-container">
      <FatalApiError :error="mainSelectorStore.apiError" />
      <admin-gameplays />
      <player-gameplays />
      <div v-if="noGamesAvailable">
        <p>Du hast noch keine Spiele, weder als Adminstrator*in noch als Teilnehmer*in. Erstelle selbst ein Spiel im
        <a href="https://editor.ferropoly.ch"> Ferropoly Editor </a> oder melde dich zu einem ausgeschriebenen Spiel an.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import MenuBar from '../../../common/components/MenuBar.vue'
import WelcomeBar from '../../../common/components/WelcomeBar.vue'
import {useMainGameSelectorStore} from '../store/MainGameSelectorStore';
import {computed, onMounted} from 'vue';
import FatalApiError from '../../../lib/components/FatalApiError.vue';
import AdminGameplays from './AdminGameplays.vue';
import PlayerGameplays from './PlayerGameplays.vue';

const mainSelectorStore = useMainGameSelectorStore();

onMounted(async () => {
  await mainSelectorStore.fetchData()
})

const noGamesAvailable = computed(() => !(mainSelectorStore.adminGameplays.length > 0 || mainSelectorStore.playerGameplays.length > 0));

</script>

<style scoped lang="scss">

</style>
