<!---
  Root element for the info app
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <div>
  <menu-bar
      :elements="infoStore.menuBarElements"
      show-user-box
      help-url="https://www.ferropoly.ch"
      help-text="Infos zum Ferropoly"
  />
    <div class="ferropoly-container">
      <router-view />
    </div>

  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import {useInfoStore} from '../store/InfoStore';

const infoStore = useInfoStore();
</script>

<style scoped lang="scss">

</style>
