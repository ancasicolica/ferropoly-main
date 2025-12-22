<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 22.12.2025
-->

<template>
  <div>
    <div v-if="picture">
    </div>
    <div v-else>
      Um Infos zu einem Bild zu erhalten, clicke auf den Titel des Bildes (Zeitpunkt und Teamname).
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  picture: {
    type:     Object,
    required: true,
    default:  () => {}
  }
})
</script>

<style scoped lang="scss">

</style>
