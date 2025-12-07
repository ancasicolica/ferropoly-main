<!---
  A card with the property infos (Status, pictures,...)
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.12.2025
-->

<template>
  <div>
    <prime-card v-if="property">
      <template #title>
        <h1>{{ property.location.name }} </h1>
      </template>
      <template #content>
        <div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title">Erreichbarkeit</div>
            <div>{{ formatAccessibility(property.location.accessibility) }}</div>
            <div class="col-span-2 title">Miete unbebaut</div>
            <div>{{ formatPrice(property.pricelist.rents.noHouse) }}</div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title">Position in Preisliste</div>
            <div>{{ property.pricelist.position + 1 }}</div>
            <div class="col-span-2 title">Miete 1 Haus</div>
            <div>{{ formatPrice(property.pricelist.rents.oneHouse) }}</div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title">Preisgruppe</div>
            <div>{{ property.pricelist.propertyGroup }}</div>
            <div class="col-span-2 title">Miete 2 Häuser</div>
            <div>{{ formatPrice(property.pricelist.rents.twoHouses) }}</div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title">Kaufpreis</div>
            <div>{{ formatPrice(property.pricelist.price) }}</div>
            <div class="col-span-2 title">Miete 3 Häuser</div>
            <div>{{ formatPrice(property.pricelist.rents.threeHouses) }}</div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title">Preis pro Haus</div>
            <div>{{ formatPrice(property.pricelist.pricePerHouse) }}</div>
            <div class="col-span-2 title">Miete 4 Häuser</div>
            <div>{{ formatPrice(property.pricelist.rents.fourHouses) }}</div>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-2 title"></div>
            <div></div>
            <div class="col-span-2 title">Miete Hotel</div>
            <div>{{ formatPrice(property.pricelist.rents.hotel) }}</div>
          </div>
        </div>
        <div v-if="property.gamedata.owner">
          <h2>Besitz</h2>
          <div class="grid grid-cols-10 gap-2">
            <div class="col-span-2 title">Gehört Team</div>
            <div class="col-span-3"> {{ property.gamedata.ownerName }}</div>
            <div class="col-span-2 title">Baustatus</div>
            <div class="col-span-3">{{ buildingStatus(property.gamedata.buildings) }}</div>
          </div>
          <div class="grid grid-cols-10 gap-2">
            <div class="col-span-2 title">Kaufdatum</div>
            <div class="col-span-3"> {{ formatTime(property.gamedata.boughtTs) }} </div>
            <div class="col-span-2 title">Bebaubar?</div>
            <div class="col-span-3"> {{ booleanYesNo(property.gamedata.buildingEnabled) }} </div>
          </div>
        </div>
      </template>
    </prime-card>
  </div>
</template>

<script setup>

import PrimeCard from 'primevue/card';
import {booleanYesNo, buildingStatus, formatAccessibility, formatPrice, formatTime} from '../../common/lib/formatters';

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => null
  }
})

</script>

<style scoped lang="scss">
.title {
  font-weight: bold;
}
</style>
