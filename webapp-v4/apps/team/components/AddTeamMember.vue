<!---
  Control to add a team member
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.11.2025
-->

<template>
  <ferro-card title="Mitglied hinzufügen">
    <p> Gib den Loginnamen an, unter welcher sich diese Person im Ferropoly angemeldet hat. Dieser ist auf der
      <a href="/account">Account</a> Seite zu finden.
    </p>
    <div class="mt-4">
      <ferropoly-input-text
          v-model="teamName"
          label="Loginname"
          validation-icons-disabled
      />
      <Button
          label="Hinzufügen"
          :disabled="disableButton"
          @click="onAdd"
      />
    </div>
  </ferro-card>
</template>

<script setup>

import FerroCard from '../../../common/components/FerroCard.vue';
import FerropolyInputText from '../../../common/components/FerropolyInputText.vue';
import {computed, ref} from 'vue';
import Button from 'primevue/button';
import {useTeamStore} from '../store/Team';

const teamStore = useTeamStore();

const teamName      = ref('');
const disableButton = computed(() => teamName.value.length < 6);

const onAdd = function () {
  teamStore.storeMember(teamName.value)
      .then(() => {
        teamName.value = '';
      })
      .catch(err => {
        console.error(err);
      });
}
</script>

<style scoped lang="scss">

</style>
