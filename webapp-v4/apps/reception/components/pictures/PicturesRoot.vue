<!---
  The picture gallery
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <picture-gallery :read-only="false" />
  </div>
</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import PictureGallery from '../../../../lib/components/pictures/PictureGallery.vue';
</script>

<style scoped lang="scss">

</style>
