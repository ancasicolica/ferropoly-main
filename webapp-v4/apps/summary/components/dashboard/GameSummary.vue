<!---
  Summary of the game, in prosa
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 02.01.2026
-->

<template>
  <div>
    <p class="mb-4">
      Das Ferropoly fand am {{ gameDate }} mit {{ nbTeams }} teilnehmenden Teams statt.
    </p>
    <p>
      Von den {{ nbProperties }} Orten auf der Preisliste wurden {{ nbPropertiesSold }} Orte gekauft,
      {{ nbPropertiesFree }} waren bei Spielende noch zu haben.
      Insgesamt wurden {{ buildingsBuilt }}
      Häuser gebaut, pro verkauftem Grundstück sind dies im Schnitt {{ buildingsPerProperty }}. Die Bank registrierte
      {{ nbTeamAccountBookings }} Buchungen für die Teams
      und weitere {{ nbChancelleryBooking }} Buchungen für Chance-Kanzlei.
      Die profitabelsten Orte waren
      <span
          v-for="(p, index) in mostProfitableProperties"
          :key="p.uuid"
      >
        {{ p.location.name }} ({{ formatPrice(p.account.profit) }}, {{ p.gamedata.ownerName }})
        <template v-if="index < mostProfitableProperties.length - 1">
          {{ index === mostProfitableProperties.length - 2 ? ' und ' : ', ' }}
        </template>
        <template v-else>.</template>
      </span>
      Am wenigsten Gewinn haben die Orte
      <span
          v-for="(p, index) in leastProfitableProperties"
          :key="p.uuid"
      >
        {{ p.location.name }} ({{ formatPrice(p.account.profit) }}, {{ p.gamedata.ownerName }})
        <template v-if="index < mostProfitableProperties.length - 1">
          {{ index === mostProfitableProperties.length - 2 ? ' und ' : ', ' }}
        </template>
      </span>
      abgeworfen.
    </p>
    <p class="mt-4">
      In diesem Rückblick findest Du alle spannenden Infos zu diesem Spiel, diese Infos bleiben bis am {{
        deletionDate
      }}
      verfügbar, dann werden sämtliche Daten zu diesem Spiel automatisch gelöscht.
    </p>

    <p class="mt-4">
      Hat Dir das Spiel gefallen? Dann würde ich mich sehr darüber freuen, wenn Du es Deinen Freundinnen und Freunden
      weiter empfehlen würdest!
    </p>

  </div>
</template>

<script setup>

import {computed} from 'vue';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import {formatGameDate, formatPrice} from '../../../../common/lib/formatters';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import {useChancelleryStore} from '../../../../lib/store/ChancelleryStore';

const gameplayStore    = useGameplayStore();
const teamsStore       = useTeamsStore();
const propertyStore    = usePropertyStore();
const teamAccountStore = useTeamAccountStore();
const chancelleryStore = useChancelleryStore();

const nbTeams = computed(() => {
  return teamsStore.teams.length;
});

const nbProperties = computed(() => {
  return propertyStore.properties.size;
});

const nbPropertiesSold = computed(() => {
  return propertyStore.boughtPropertiesNb;
});

const nbPropertiesFree = computed(() => {
  return propertyStore.freePropertiesNb;
});

const buildingsBuilt = computed(() => {
  return propertyStore.buildingNb;
});

const buildingsPerProperty = computed(() => {
      if (propertyStore.boughtPropertiesNb === 0) {
        return 0;
      }
      return Math.round(100 * propertyStore.buildingNb / propertyStore.boughtPropertiesNb) / 100;
    }
);

const nbTeamAccountBookings = computed(() => {
  return teamAccountStore.bookingsNb;
});

const nbChancelleryBooking = computed(() => {
  return chancelleryStore.records.size;
});

const gameDate = computed(() => {
  return formatGameDate(gameplayStore.gameplay.scheduling.gameDate);
});

const deletionDate = computed(() => {
  return formatGameDate(gameplayStore.gameplay.scheduling.deleteTs);
});

const mostProfitableProperties = computed(() => {
  return propertyStore.mostProfitableProperties;
})

const leastProfitableProperties = computed(() => {
  return propertyStore.leastProfitableProperties;
})
</script>

<style scoped lang="scss">

</style>
