<!---
  A Card for a gameplay where the user is admin
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.11.2025
-->

<template>
  <div>
    <ferro-card :title="gameplay.gamename">
      <div class="flex flex-row">
        <div class="basis-64">Spieldatum</div>
        <div class="basis-128"> {{ gameDate }}</div>
      </div>
      <div class="flex flex-row">
        <div class="basis-64">Spielstart</div>
        <div class="basis-128"> {{ gameStart }}</div>
      </div>
      <div class="flex flex-row">
        <div class="basis-64">Spielende</div>
        <div class="basis-128"> {{ gameEnd }}</div>
      </div>
      <div class="flex flex-row">
        <div class="basis-64">Karte</div>
        <div class="basis-128"> {{ map }}</div>
      </div>
      <div class="flex flex-row">
        <div class="basis-64">Löschdatum</div>
        <div class="basis-128"> {{ deleteTs }}</div>
      </div>
      <div class="gameplay-id"> ID: {{ gameplay.internal.gameId }}</div>
      <Button
          v-if="gameRunning"
          class="mr-2 mb-2"
          label="Spielen"
          size="small"
          severity="primary"
          as="a"
          :href="receptionLink"
      />
      <Button
          v-if="gameOver || gameInFuture"
          class="mr-2 mb-2"
          label="Spiel ansehen"
          size="small"
          severity="secondary"
          as="a"
          :href="receptionLink"
      />
      <Button
          class="mr-2 mb-2"
          label="Preisliste"
          size="small"
          severity="secondary"
          as="a"
          :href="pricelistLink"
      />
      <Button
          v-if="gameOver"
          class="mr-2 mb-2"
          label="Zusammenfassung"
          size="small"
          severity="info"
          as="a"
          :href="summaryLink"
      />
    </ferro-card>
  </div>
</template>

<script setup>

import FerroCard from '../../../common/components/FerroCard.vue';
import {formatGameDate, formatGameTime, formatMap} from '../../../common/lib/formatters';
import {computed} from 'vue';
import Button from 'primevue/button';
import {DateTime} from 'luxon';

const props = defineProps({
  gameplay: {
    type:     Object,
    required: true,
    default:  () => {
      return {
        gamename: ''
      }
    }
  }
});

const gameDate      = computed(() => formatGameDate(props.gameplay.scheduling.gameDate));
const gameStart     = computed(() => formatGameTime(props.gameplay.scheduling.gameStart));
const gameEnd       = computed(() => formatGameTime(props.gameplay.scheduling.gameEnd));
const map           = computed(() => formatMap(props.gameplay.internal.map));
const deleteTs      = computed(() => formatGameDate(props.gameplay.scheduling.deleteTs));
const pricelistLink = computed(() => `/info/${props.gameplay.internal.gameId}`);
const receptionLink = computed(() => `/reception/${props.gameplay.internal.gameId}`);
const summaryLink = computed(() => `/summary/${props.gameplay.internal.gameId}`);
const gameRunning = computed(() => {
  if (!props.gameplay.internal.finalized) {
    return false;
  }
  const gameDate = DateTime.fromJSDate(props.gameplay.scheduling.gameDate);
  const now      = DateTime.now();
  return gameDate.hasSame(now, 'day') && now <= DateTime.fromFormat(props.gameplay.scheduling.gameEnd, 'HH:mm');
});
const gameOver    = computed(() => {
  if (!props.gameplay.internal.finalized) {
    return false;
  }
  const gameDate        = DateTime.fromJSDate(props.gameplay.scheduling.gameDate);
  const endTime         = DateTime.fromFormat(props.gameplay.scheduling.gameEnd, 'HH:mm');
  const gameEndDateTime = gameDate.set({hour: endTime.hour, minute: endTime.minute});
  return DateTime.now() > gameEndDateTime;
});

const gameInFuture = computed(() => {
  const gameDate = DateTime.fromJSDate(props.gameplay.scheduling.gameDate);
  const now      = DateTime.now();
  return gameDate.startOf('day') > now.startOf('day');
});

</script>

<style scoped lang="scss">
.gameplay-id {
  color: darkgray;
  font-size: xx-small;
}

</style>
