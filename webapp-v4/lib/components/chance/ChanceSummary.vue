<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 12.12.2025
-->

<template>
  <div>
    <ferro-card
        title="Übersicht"
        condensed
    >
      <div>
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2 title">Anzahl Einträge</div>
          <div>{{ chancelleryStore.records.size }}</div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2 title">Parkplatz</div>
          <div>{{ formatPrice(chancelleryStore.balance) }}</div>
        </div>
      </div>
    </ferro-card>
  </div>
</template>

<script setup>

import FerroCard from '../../../common/components/FerroCard.vue';
import {formatPrice} from '../../../common/lib/formatters';
import {useChancelleryStore} from '../../store/ChancelleryStore';


const chancelleryStore = useChancelleryStore();


</script>

<style scoped lang="scss">

</style>
