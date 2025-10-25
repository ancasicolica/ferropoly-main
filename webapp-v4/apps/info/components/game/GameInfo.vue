<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <ferro-card
      title="Spielinfo"
  >
    <div class="flex flex-row">
      <div class="basis-64">Spieldatum</div>
      <div class="basis-128">{{ gameDate }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Startzeit</div>
      <div class="basis-128">{{ infoStore.gameInfo.start }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Spielende</div>
      <div class="basis-128">{{ infoStore.gameInfo.end }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Spielleitung</div>
      <div class="basis-128">{{ infoStore.gameInfo.organisator }}</div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Email</div>
      <div class="basis-128">
        <a :href="email"> {{ infoStore.gameInfo.email }}</a>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Telefon während Spiel</div>
      <div class="basis-128">{{ infoStore.gameInfo.phone }}</div>
    </div>
  </ferro-card>
</template>

<script setup>

import FerroCard from '../../../../common/components/FerroCard.vue';
import {useInfoStore} from '../../store/InfoStore';
import {computed} from 'vue';
import {formatGameDate} from '../../../../common/lib/formatters';

const infoStore = useInfoStore();

const email = computed(() => `mailto:${infoStore.gameInfo.email}`);
const gameDate = computed(()=> formatGameDate(infoStore.gameInfo.date));
</script>

<style scoped lang="scss">

</style>
