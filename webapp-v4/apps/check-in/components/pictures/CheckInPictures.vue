<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <picture-gallery
        :read-only="true"
        :team-id="checkInStore.team.uuid"
    />
  </div>
</template>

<script setup>

import PictureGallery from '../../../../lib/components/pictures/PictureGallery.vue';
import {useCheckInStore} from '../../store/CheckInStore';

const checkInStore = useCheckInStore();

</script>

<style scoped lang="scss">

</style>
