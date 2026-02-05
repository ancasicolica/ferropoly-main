<!---
  The properties of a tea
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <h1>Besitz</h1>
    <div
        v-for="prop in properties"
        :key="prop.uuid"
    >
      <property-card :property="prop" />
    </div>
  </div>
</template>

<script setup>
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {computed} from 'vue';
import {useCheckInStore} from '../../store/CheckInStore';
import PropertyCard from './propertyCard.vue';

const propertyStore = usePropertyStore();
const checkInStore  = useCheckInStore();
const properties    = computed(() => {
  return propertyStore.propertiesByTeamId(checkInStore?.team.uuid).sort((a, b) => a.location.name.localeCompare(b.location.name));
})


</script>

<style scoped lang="scss">

</style>
