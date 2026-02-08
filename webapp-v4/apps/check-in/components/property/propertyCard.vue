<!---
  A card for the checkin property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.02.2026
-->

<template>
  <div class="property-card">
    <div class="title"> {{ property.location.name }}</div>
    <div class="row">
      <span class="label">Kaufzeit:</span>
      <span class="value">{{ formatGameTime(property.gamedata.boughtTs) }}</span>
    </div>
    <div class="row">
      <span class="label">Anzahl Häuser:</span>
      <span class="value">{{ buildingStatus(property.gamedata.buildings) }}</span>
    </div>
    <div
         v-if="property.gamedata.buildings < 5"
         class="row"
    >
      <span class="label">Hausbau möglich:</span>
      <span class="value">{{ booleanYesNo(property.gamedata.buildingEnabled) }}</span>
    </div>
    <div class="row">
      <span class="label">Gewinn:</span>
      <span class="value">{{ formatPrice(property.account.profit) }}</span>
    </div>
  </div>
</template>

<script setup>
import {booleanYesNo, buildingStatus, formatGameTime, formatPrice} from '../../../../common/lib/formatters';

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => {
      return {
        buildings: 0
      }
    }
  }
});
</script>

<style scoped lang="scss">
.property-card {
  margin-bottom: 8px;

  .title {
    font-weight: bold;
    background-color: lightblue;
  }

  .row {
    display: flex;
    justify-content: space-between;

    .label {
      text-align: left;
    }

    .value {
      text-align: right;
    }
  }
}
</style>
