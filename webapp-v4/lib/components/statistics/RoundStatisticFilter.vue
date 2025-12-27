<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div>
    <h3>Berücksichtigte Werte</h3>

    <div class="mt-4">
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.hourlyFee"
            input-id="hourlyFee"
            binary
        />
        <label for="hourlyFee"> Startgeld </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.interest"
            input-id="interest"
            binary
        />
        <label for="interest"> Stündlicher Ortszins </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.chancellery"
            input-id="chancellery"
            binary
        />
        <label for="chancellery"> Chance/Kanzlei </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.gambling"
            input-id="gambling"
            binary
        />
        <label for="gambling"> Gambling </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.rent"
            input-id="rent"
            binary
        />
        <label for="rent"> Miete </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.housePurchase"
            input-id="housePurchase"
            binary
        />
        <label for="housePurchase"> Kauf Häuser </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.propertyPurchase"
            input-id="propertyPurchase"
            binary
        />
        <label for="propertyPurchase"> Kauf Orte </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.penalty"
            input-id="penalty"
            binary
        />
        <label for="penalty"> Strafzins </label>
      </div>
      <div class="mb-2">
        <Checkbox
            v-model="statisticStore.filter.various"
            input-id="various"
            binary
        />
        <label for="various"> Diverses </label>
      </div>
    </div>
  </div>

</template>

<script setup>
import Checkbox from 'primevue/checkbox';
import {useStatisticStore} from '../../store/StatisticStore';

const statisticStore = useStatisticStore();
</script>

<style scoped lang="scss">

</style>
