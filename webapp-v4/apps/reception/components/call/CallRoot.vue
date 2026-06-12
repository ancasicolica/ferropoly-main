<!---
  Root element for calls
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <div v-if="gameplayStore.gameActive">
      <div v-if="!receptionStore.callActive">
        <Message
            v-if="!gameplayStore.gameActive"
            severity="warn"
        >
          Anrufe können nur bei laufendem Spiel angenommen werden.
        </Message>
        <h1>Anrufendes Team auswählen</h1>
        <team-selector @team-calling="onTeamCalling" />
      </div>
      <div v-if="receptionStore.callActive">
        <call-active />
      </div>
    </div>
    <div v-else>
      <ferro-jumbotron
          title="Kein aktives Spiel"
          info="Aktuell können keine Anrufe behandelt werden."
      />
    </div>
    <Dialog
        :visible="dialogActive"
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
        <li>Mit "Nachtrag" kann ein unterbrochener Anruf fortgesetzt werde, Chance/Kanzlei wird nicht ausgeführt</li>
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
            :disabled="activitySelected"
            @click="onEditCallConfirmed"
        />
        <Button
            type="button"
            label="Bearbeiten"
            severity="primary"
            :disabled="activitySelected"
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
import {computed, onMounted, ref} from 'vue';
import CallActive from './CallActive.vue';
import Message from 'primevue/message';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import FerroJumbotron from '../../../../lib/components/FerroJumbotron.vue';

const activitySelected = ref(false);
const dialogActive     = computed({
  get: () => {
    return callingTeam.value !== null;
  },
  set: () => {
    callingTeam.value = null;
  }

})
const callingTeam      = ref(null);

const receptionStore = useReceptionStore();
const gameplayStore  = useGameplayStore();

const onTeamCalling = (team) => {
  console.log('team is calling', team.value);
  activitySelected.value = false;
  callingTeam.value      = team;
}
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/call/')
});
const onNormalCallConfirmed = () => {
  activitySelected.value = true;
  if (callingTeam.value) {
    receptionStore.startTeamCall(callingTeam.value, true);
  }
  callingTeam.value = null;
}
const onEditCallConfirmed   = () => {
  activitySelected.value = true;
  if (callingTeam.value) {
    receptionStore.startTeamCall(callingTeam.value, false);
  }
  callingTeam.value = null;
}
const onCancel              = () => {
  receptionStore.finishCall();
  callingTeam.value = null;
}
</script>

<style scoped lang="scss">

</style>
