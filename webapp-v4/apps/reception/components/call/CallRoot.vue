<!---
  Root element for calls
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <div v-if="!receptionStore.callActive">
      <h1>Anrufendes Team auswählen</h1>
      <team-selector @team-calling="onTeamCalling" />
    </div>
    <div v-if="receptionStore.callActive">
      <call-active />
    </div>
    <Dialog
        v-model:visible="dialogActive"
        modal
        header="Anruf bestätigen"
        position="top"
    >
      <div>Bitte bestätigen, dass das folgende Team bearbeitet werden soll:</div>
      <h1> {{ callingTeam.data.name }} </h1>
      <h2> {{ callingTeam.data.organization }} </h2>
      <p>Möglichkeiten:</p>
      <ul>
        <li>Mit "Bearbeiten" wird ein normaler Anruf eingeleitet, d.h. Chance/Kanlzei wird ausgeführt</li>
        <li>Mit "Nachtrag" kann ein unterbrochener Anruf fortgesetzt werde, Chance/Kanlzei wird nicht ausgeführt</li>
        <li>Mit "Abbrechen" verlässt Du diesen Dialog ohne weitere Aktionen</li>
      </ul>
      <p>Was willst Du tun?</p>
      <div class="flex flex-row-reverse gap-4">
        <!--- WATCH FOR THE ORDER!! -->
        <Button
            type="button"
            label="Abbrechen"
            severity="secondary"
            @click="onCancel"
        />
        <Button
            type="button"
            label="Nachtrag"
            severity="secondary"
            @click="onEditCallConfirmed"
        />
        <Button
            type="button"
            label="Bearbeiten"
            severity="primary"
            @click="onNormalCallConfirmed"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import {useReceptionStore} from '../../store/ReceptionStore';
import TeamSelector from './TeamSelector.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import {computed, ref} from 'vue';
import CallActive from './CallActive.vue';

const dialogActive = computed({
  get: () => {
    return callingTeam.value !== null;
  },
  set: () => {
    callingTeam.value = null;
  }

})
const callingTeam  = ref(null);

const receptionStore = useReceptionStore();

const onTeamCalling = (team) => {
  receptionStore.startTeamCall(team, true);
  return;
  console.log('team is calling', team.value);
  callingTeam.value = team;
}

const onNormalCallConfirmed = () => {
  receptionStore.startTeamCall(callingTeam.value, true);
  callingTeam.value = null;
}
const onEditCallConfirmed   = () => {
  receptionStore.startTeamCall(callingTeam.value, false);
  callingTeam.value = null;
}
const onCancel              = () => {
  receptionStore.finishCall();
  callingTeam.value = null;
}
</script>

<style scoped lang="scss">

</style>
