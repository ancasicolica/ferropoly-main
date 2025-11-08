<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 07.11.2025
-->

<template>
  <div>
    <menu-bar
        :elements="receptionStore.menuBarElements"
        show-online-status
        help-url="/about"
    />
    <div class="ferropoly-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import {useReceptionStore} from '../store/ReceptionStore';

const receptionStore = useReceptionStore();
</script>

<style scoped lang="scss">

</style>
