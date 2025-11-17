<!---
  Card with Team Info
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 15.11.2025
-->

<template>
  <div style="width: 100%">
    <Panel
        style="width: 100%"
        :pt="{header:{style:{'padding-top': '4px','padding-bottom': '4px'}}}">
      <template #header>
        <div class="panel-header">
          <h3> {{ team.data.name }} </h3>
        </div>
      </template>
      <template #icons>
        <div
            id="color-tag"
            :style="cssVars"
        > &#9608;&#9608;
        </div>
      </template>
      <div>
        <div> {{ team.data.organization }}</div>
        <details>
          <summary>Teammitglieder</summary>
          <div> {{ team.data.teamLeader.name }}</div>
          <div
              v-for="m in team.data.members"
              :key="m.login"
          >
            <div v-if="m.personalData">
              {{ m.personalData.forename }} {{ m.personalData.surname }}
            </div>
            <div v-if="!m.personalData">
              {{ m.login }}
            </div>
          </div>
        </details>
        <Button label="Anruf bearbeiten" @click="onClickCall" />
      </div>
    </Panel>
  </div>
</template>

<script setup>

import Button from 'primevue/button';
import Panel from 'primevue/panel';
import {computed} from 'vue';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';

const teamsStore = useTeamsStore();
const props      = defineProps({
  team: {
    type:     Object,
    required: true,
    default:  () => {
    }
  }
});


const cssVars = computed(() => {
  return {'--team-color': props.team.color};
})

const emit = defineEmits(['team-calling']);

const onClickCall = () => {
  emit('team-calling', props.team);
}
</script>

<style scoped lang="scss">
#color-tag {
  color: var(--team-color);
}

.p-panel-header {
  padding-bottom: 2px;
  padding-top: 2px;
}
</style>
