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
import {onMounted} from 'vue';

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import PictureGallery from '../../../../lib/components/pictures/PictureGallery.vue';
import {useReceptionStore} from '../../store/ReceptionStore';

const receptionStore = useReceptionStore();
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/pictures/')
});
</script>

<style scoped lang="scss">

</style>
