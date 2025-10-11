<!---
  Game selector for the main game
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <menu-bar
        :elements="mainSelectorStore.menuBarElements"
        show-user-box
        help-url="/about"
        help-text="Infos / Kontakt"
    />
    <welcome-bar user-name="ABC" />
    <FatalApiError :error="mainSelectorStore.apiError" />
  </div>
</template>

<script setup>
import MenuBar from '../../../common/components/MenuBar.vue'
import WelcomeBar from '../../../common/components/WelcomeBar.vue'
import {useMainGameSelectorStore} from '../store/MainGameSelectorStore';
import {onMounted} from 'vue';
import FatalApiError from '../../../lib/components/FatalApiError.vue';

const mainSelectorStore = useMainGameSelectorStore();

onMounted(async () => {
  await mainSelectorStore.fetchData()
})
</script>

<style scoped lang="scss">

</style>
