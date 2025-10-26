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
      <FatalApiError :error="infoStore.apiError" />
      <div v-if="showContents">
        <router-view />
      </div>
    </div>

  </div>
</template>

<script setup>

import MenuBar from '../../../common/components/MenuBar.vue';
import {useInfoStore} from '../store/InfoStore';
import {computed, onMounted} from 'vue';
import {last, split} from 'lodash';
import FatalApiError from '../../../lib/components/FatalApiError.vue';

const infoStore = useInfoStore();

const showContents = computed(()=> !infoStore.apiError && infoStore.dataLoaded )
onMounted(() => {
  const elements = split(window.location.pathname, '/');
  let gameId     = last(elements);
  infoStore.fetchData(gameId).then(() => {
    console.log('data loaded');
  });
})
</script>

<style scoped lang="scss">

</style>
