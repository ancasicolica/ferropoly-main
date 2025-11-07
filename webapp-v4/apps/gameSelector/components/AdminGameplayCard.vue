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
          label="Preisliste"
          size="small"
          severity="secondary"
          as="a"
          :href="pricelistLink"
      />
    </ferro-card>
  </div>
</template>

<script setup>

import FerroCard from '../../../common/components/FerroCard.vue';
import {formatGameDate, formatGameTime, formatMap} from '../../../common/lib/formatters';
import {computed} from 'vue';
import Button from 'primevue/button';

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
const pricelistLink = computed(() => `/info/${props.gameplay.internal.gameId}`)
</script>

<style scoped lang="scss">
.gameplay-id {
  color: darkgray;
  font-size: xx-small;
}
</style>
