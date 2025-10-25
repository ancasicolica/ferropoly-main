<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <div v-if="!pricelistAvailable">
      <ferro-jumbotron
          :title="infoStore.gameInfo.gameName"
          info="Sobald die Preisliste verfügbar ist, kannst Du die Karte anschauen. Komme später wieder vorbei!"
      >
      </ferro-jumbotron>
    </div>
  </div>
</template>

<script setup>
import {useInfoStore} from '../store/InfoStore';
import {computed} from 'vue';
import FerroJumbotron from '../../../lib/components/FerroJumbotron.vue';

const infoStore = useInfoStore();

const pricelistAvailable = computed(() => infoStore.pricelist.length > 0)

</script>

<style scoped lang="scss">

</style>

