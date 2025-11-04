<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.11.2025
-->

<template>
  <div>
    <ferro-card :title="title">
      <div class="flex flex-row">
        <div class="basis-64">Organisiert von:</div>
        <div class="basis-128">
          <a :href="ownerEmail"> {{ owner }} </a>
        </div>
      </div>
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
          v-if="isTeamLead"
          label="Team Mitglieder"
          size="small"
          icon="pi pi-users"
          severity="secondary"
          as="a"
          :href="teamEditLink"
      />
    </ferro-card>
  </div>
</template>

<script setup>

import Button from 'primevue/button';
import FerroCard from '../../../common/components/FerroCard.vue';
import {formatGameDate, formatGameTime, formatMap} from '../../../common/lib/formatters';
import {computed} from 'vue';

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

const title      = computed(() => `${props.gameplay.gamename}, Team "${props.gameplay.team.data.name}"`);
const owner      = computed(() => props.gameplay.owner.organisatorName);
const ownerEmail = computed(() => `mailto:${props.gameplay.owner.organisatorEmail}`);
const gameDate   = computed(() => formatGameDate(props.gameplay.scheduling.gameDate));
const gameStart  = computed(() => formatGameTime(props.gameplay.scheduling.gameStart));
const gameEnd    = computed(() => formatGameTime(props.gameplay.scheduling.gameEnd));
const map        = computed(() => formatMap(props.gameplay.internal.map))
const deleteTs   = computed(() => formatGameDate(props.gameplay.scheduling.deleteTs))
const isTeamLead   = computed(() => props.gameplay.isTeamLead)
const teamEditLink = computed(()=> `/team/edit/${props.gameplay.internal.gameId}/${props.gameplay.team.uuid}`)
</script>

<style scoped lang="scss">
.gameplay-id {
  color: darkgray;
  font-size: xx-small;
}
</style>
