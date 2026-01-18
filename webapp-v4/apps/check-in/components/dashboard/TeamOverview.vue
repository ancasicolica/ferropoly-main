<!---
  The overview of a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.2026
-->

<template>
  <!-- Main container with shadow and padding -->
  <div class="shadow-md p-4 rounded-lg bg-white max-w-md">
    <div class="grid grid-cols-2 gap-y-0 gap-x-2">
      <!-- Row 1 -->
      <div class="text-gray-600 font-medium">Vermögen</div>
      <div class="text-right font-bold text-slate-900"> {{ asset }}</div>

      <!-- Row 2 -->
      <div class="text-gray-600 font-medium">Gekaufte Orte</div>
      <div class="text-right font-bold text-slate-900"> {{ nbProperties }} </div>

      <!-- Row 3 -->
      <div class="text-gray-600 font-medium">Mietwert akt.</div>
      <div class="text-right font-bold text-slate-900"> {{ currentRent }} </div>

      <!-- Row 4 -->
      <div class="text-gray-600 font-medium">Mietwert max</div>
      <div class="text-right font-bold text-slate-900"> {{ maxRent }} </div>
    </div>
  </div>
</template>

<script setup>

import {useTeamAccountStore} from '../../../../lib/store/TeamAccountStore';
import {useCheckInStore} from '../../store/CheckInStore';
import {computed} from 'vue';
import {formatPrice} from '../../../../common/lib/formatters';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {evaluatePropertyValueForTeam} from '../../../../lib/propertyLib';

const teamAccountStore = useTeamAccountStore();
const checkInStore     = useCheckInStore();
const propertyStore    = usePropertyStore();

const asset = computed(() => {
  return formatPrice(teamAccountStore.balances.get(checkInStore.team.uuid)?.balance);
});

const nbProperties = computed(() => {
  return propertyStore.propertiesByTeamId(checkInStore.team.uuid).length;
});

const currentRent = computed(()=> {
  const val = evaluatePropertyValueForTeam(checkInStore.team.uuid);
  return formatPrice(val.sum);
});

const maxRent = computed(()=> {
  const val = evaluatePropertyValueForTeam(checkInStore.team.uuid);
  return formatPrice(val.max);
});
</script>

<style scoped lang="scss">

</style>
