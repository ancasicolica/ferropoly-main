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
      <Button label="Hinzufügen" :disabled="disableButton" />
    </div>
  </ferro-card>
</template>

<script setup>

import FerroCard from '../../../common/components/FerroCard.vue';
import FerropolyInputText from '../../../common/components/FerropolyInputText.vue';
import {computed, ref} from 'vue';
import Button from 'primevue/button';

const teamName      = ref('');
const disableButton = computed(() => teamName.value.length < 6)
</script>

<style scoped lang="scss">

</style>
