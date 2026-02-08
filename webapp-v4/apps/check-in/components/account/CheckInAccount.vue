<!---
  The account of a team
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <h1>Kontobuch</h1>
    <team-account
        :team-id="teamId"
        :sort-order="sortOrder"
    />
  </div>
</template>

<script setup>

import TeamAccount from '../../../../lib/components/teamAccount/TeamAccount.vue';
import {computed} from 'vue';
import {useCheckInStore} from '../../store/CheckInStore';

const checkInStore = useCheckInStore();

const teamId = computed(() => {
  return checkInStore?.team?.uuid;
})

const sortOrder = computed(() => {
  return -1;
})
</script>

<style scoped lang="scss">

</style>
