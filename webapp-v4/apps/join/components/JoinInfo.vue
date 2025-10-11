<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <h1> {{ joinStore.gameplay.gamename }} </h1>
    <div v-html="joinTextRaw" />
  </div>
</template>

<script setup>
import {useJoinStore} from '../store/joinStore';
import {computed} from 'vue';

const joinStore = useJoinStore();

const joinTextRaw = computed(() => {
  const text = joinStore.gameplay.joining.infotext;
  // Replace non-breaking spaces with regular spaces
  return text ? text.replace(/&nbsp;/g, ' ') : '';
})

</script>

<style scoped lang="scss">

</style>
