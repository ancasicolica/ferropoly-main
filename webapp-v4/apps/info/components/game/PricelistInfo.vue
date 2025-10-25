<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
    <ferro-card
        title="Preisliste"
    >
      <div v-if="!pricelistAvailable">Die Preisliste ist noch in Bearbeitung. Sobald sie fertig ist, kannst Du sie hier
        anschauen.
      </div>
    </ferro-card>
  </div>
</template>

<script setup>
import FerroCard from '../../../../common/components/FerroCard.vue';
import {useInfoStore} from '../../store/InfoStore';
import {computed} from 'vue';

const infoStore = useInfoStore();

const pricelistAvailable = computed(() => infoStore.pricelist.length > 0)
</script>

<style scoped lang="scss">

</style>
