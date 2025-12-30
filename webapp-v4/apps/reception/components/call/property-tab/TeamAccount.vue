<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 13.12.2025
-->

<template>
  <div>
    <ferro-card
        title="Konto"
        condensed
    >
      <team-account
          :team-id="receptionStore.activeCall.team.uuid"
          :sort-order="-1"
      />
    </ferro-card>

  </div>
</template>

<script setup>

import FerroCard from '../../../../../common/components/FerroCard.vue';
import TeamAccount from '../../../../../lib/components/teamAccount/TeamAccount.vue';
import {useReceptionStore} from '../../../store/ReceptionStore';

const receptionStore = useReceptionStore();

</script>

<style scoped lang="scss">

</style>
