<!---
  Owner Info of a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.12.2025
-->

<template>
  <div>
    <div v-if="property.gamedata.owner">
      <div class="grid grid-cols-10 gap-2">
        <div class="col-span-2 title">Gehört Team</div>
        <div class="col-span-3"> {{ property.gamedata.ownerName }}</div>
        <div class="col-span-2 title">Baustatus</div>
        <div class="col-span-3">{{ buildingStatus(property.gamedata.buildings) }}</div>
      </div>
      <div class="grid grid-cols-10 gap-2">
        <div class="col-span-2 title">Kaufdatum</div>
        <div class="col-span-3"> {{ formatTime(property.gamedata.boughtTs) }}</div>
        <div class="col-span-2 title">Bebaubar?</div>
        <div class="col-span-3"> {{ booleanYesNo(property.gamedata.buildingEnabled) }}</div>
      </div>
      <div class="grid grid-cols-10 gap-2">
        <div class="col-span-2 title">Profit</div>
        <div
            class="col-span-3"
            :class="{ 'negative-amount': property.account.profit < 0 }"
        >
          {{ formatPrice(property.account.profit) }}
        </div>
        <div class="col-span-2 title"></div>
        <div class="col-span-3"></div>
      </div>
      <div class="mt-4">
        <property-account-bookings :property="property" />
      </div>
    </div>
    <div v-if="!property.gamedata.owner">
      <p>Das Ort gehört noch keiner Gruppe.</p>
    </div>
  </div>
</template>

<script setup>
import {booleanYesNo, buildingStatus, formatPrice, formatTime} from '../../../common/lib/formatters';
import PropertyAccountBookings from './PropertyAccountBookings.vue';

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => null
  }
})
</script>

<style scoped lang="scss">
.negative-amount {
  color: red;
}
</style>
