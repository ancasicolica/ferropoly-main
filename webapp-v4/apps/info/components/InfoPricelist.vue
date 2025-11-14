<!---
  Pricelist for info
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <div v-if="!pricelistAvailable">
      <ferro-jumbotron
          :title="infoStore.gameInfo.gameName"
          info="Die Preisliste für dieses Spiel ist noch nicht fertig erstellt. Komme später wieder vorbei!"
      >
      </ferro-jumbotron>
    </div>
    <div v-if="pricelistAvailable">
      <ferropoly-pricelist
          :gamename="gamename"
          :game-date="gameDate"
          :game-start="gameStart"
          :game-end="gameEnd"
          :pricelist="pricelist"
      />
    </div>
  </div>
</template>

<script setup>
import {useInfoStore} from '../store/InfoStore';
import {computed} from 'vue';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';
import FerropolyPricelist from '../../../common/components/FerropolyPricelist.vue';
import {usePropertyStore} from '../../../lib/store/PropertyStore';

const infoStore = useInfoStore();
const propertyStore = usePropertyStore();

const pricelistAvailable = computed(() => propertyStore.properties.size > 0)

const gamename = computed(() => infoStore.gameInfo.gameName);
const gameDate = computed(() => infoStore.gameInfo.date);
const gameStart = computed(() => infoStore.gameInfo.start);
const gameEnd = computed(() => infoStore.gameInfo.end);
const pricelist = computed(() => [...propertyStore.properties.values()]);

</script>

<style scoped lang="scss">

</style>
