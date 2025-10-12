<!---
  Info about the joining dates
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <h4 class="join"> Spieldaten </h4>
    <div class="flex flex-row">
      <div class="basis-64">Datum</div>
      <div class="basis-128">
        <div> {{ gameDate }}</div>
        <div> {{ gameStart }} - {{ gameEnd }}</div>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Anmeldeschluss</div>
      <div class="basis-128">{{ registrationEnd }}, {{ registrationRelative }}</div>
    </div>

  </div>
</template>

<script setup>
import {useJoinStore} from '../store/joinStore';
import {formatDateTime, formatGameDate, formatTimestampAsAgo} from '../../../common/lib/formatters';
import {computed} from 'vue';

const joinStore = useJoinStore();

const gameDate             = computed(() => formatGameDate(joinStore.gameplay.scheduling.gameDate))
const gameStart            = computed(() => joinStore.gameplay.scheduling.gameStart)
const gameEnd              = computed(() => joinStore.gameplay.scheduling.gameEnd)
const registrationEnd      = computed(() => formatDateTime(joinStore.gameplay.joining.possibleUntil))
const registrationRelative = computed(() => formatTimestampAsAgo(joinStore.gameplay.joining.possibleUntil))
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
