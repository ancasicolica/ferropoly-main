<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.11.2025
-->

<template>
  <div>
    <menu-bar
        :elements="teamStore.menuBarElements"
        show-user-box
    />
    <div class="ferropoly-container">
      <h1>Team Mitglieder</h1>
      <p>Hier kannst Du Deine Mitspieler*innen zum Team hinzufügen. Diese haben vollen Zugriff auf das Spiel, können
        aber keine weiteren Mitglieder einladen.</p>
      <p class="mt-2">
        <i
            class="pi pi-exclamation-circle"
            style="color: red"
        />
        WICHTIG: erfasse nur Personen, welche beim Spiel auch wirklich dabei sind: Die Position der Spieler wird während
        dem Spiel erfasst, es könnte sonst zu einem "Gruppe geteilt Alarm" in der Zentrale kommen.
      </p>
      <div class="flex flex-wrap mt-2">
        <div class="basis-full md:basis-1/2 md:pr-1">
          <add-team-member />
        </div>
        <div class="basis-full md:basis-1/2 md:pl-1">
          <team-member-list />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {onMounted} from 'vue';
import {split} from 'lodash';
import {useTeamStore} from '../store/Team';
import MenuBar from '../../../common/components/MenuBar.vue';
import AddTeamMember from './AddTeamMember.vue';
import TeamMemberList from './TeamMemberList.vue';

const teamStore = useTeamStore();

onMounted(() => {
  const elements = split(window.location.pathname, '/');
  const gameId   = elements[elements.length - 2];
  const teamId   = elements[elements.length - 1];
  teamStore.fetchData(gameId, teamId);
})
</script>

<style scoped lang="scss">

</style>
