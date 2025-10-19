<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 19.10.2025
-->

<template>
  <div v-if="infoVisible">
    <h4 class="join"> Meine Anmeldung </h4>
    <div class="flex flex-row">
      <div class="basis-64">Anmeldedatum</div>
      <div class="basis-128">{{ registrationDate }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Letzte Änderung</div>
      <div class="basis-128">{{ changedDate }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Anmeldung bestätigt</div>
      <div class="basis-128">{{ confirmed }}</div>
    </div>
  </div>
</template>

<script setup>
import {useJoinStore} from '../store/joinStore';
import {computed} from 'vue';
import {booleanYesNo, formatDateTime} from '../../../common/lib/formatters';

const joinStore = useJoinStore();

const infoVisible = computed(() => joinStore.teamInfo.registrationDate);

const registrationDate = computed(() => {
  return formatDateTime(joinStore.teamInfo.registrationDate);
});
const changedDate      = computed(() => {
  return formatDateTime(joinStore.teamInfo.changedDate);
});
const confirmed        = computed(() => {
  return booleanYesNo(joinStore.teamInfo.confirmed);
});

</script>

<style scoped lang="scss">
h4.join {
  border-bottom: #ccc;
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom-width: thin;
  border-bottom-style: solid;
  margin-top: 5px;
}
</style>
