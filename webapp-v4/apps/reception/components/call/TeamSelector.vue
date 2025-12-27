<!---
  The selector for the teams before a call
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 15.11.2025
-->

<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-start gap-4">

    <team-card
        v-for="team in teams"
        :key="team.uuid"
        class="flex-[0_0_22rem] flex"
        :team="team"
        @team-calling="onTeamCalling"
        @viewTeam="onViewTeam"
    />

  </div>
</template>

<script setup>

import TeamCard from './TeamCard.vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {computed} from 'vue';
import {useReceptionStore} from '../../store/ReceptionStore';

const teamsStore = useTeamsStore();
const receptionStore= useReceptionStore();

const teams = computed(() => [...teamsStore.teams]);

const emit          = defineEmits(['team-calling']);
const onTeamCalling = (team) => {
  emit('team-calling', team);
}

const onViewTeam = (team) => {
  receptionStore.viewTeam(team);
}
</script>

<style scoped lang="scss">

</style>
