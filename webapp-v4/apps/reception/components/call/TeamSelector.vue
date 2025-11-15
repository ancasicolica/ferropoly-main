<!---
  The selector for the teams before a call
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 15.11.2025
-->

<template>
  <div class="flex flex-wrap items-stretch">

    <team-card
        v-for="team in teams"
        :key="team.uuid"
        class="flex-[0_0_16rem] ml-1 mr-1 mb-2 flex"
        :team="team"
        @team-calling="onTeamCalling"
    />

  </div>
</template>

<script setup>

import TeamCard from './TeamCard.vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {computed} from 'vue';

const teamsStore = useTeamsStore();

const teams = computed(() => [...teamsStore.teams]);

const emit          = defineEmits(['team-calling']);
const onTeamCalling = (team) => {
  emit('team-calling', team);
}
</script>

<style scoped lang="scss">

</style>
