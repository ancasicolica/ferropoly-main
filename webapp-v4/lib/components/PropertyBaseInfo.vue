<!---
  Static base info of a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 21.12.2025
-->

<template>
  <div>
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
  </div>
</template>

<script setup>
import {formatAccessibility, formatPrice} from '../../common/lib/formatters';

const props = defineProps({
  property: {
    type:     Object,
    required: true,
    default:  () => null
  }
})

</script>

<style scoped lang="scss">

</style>
