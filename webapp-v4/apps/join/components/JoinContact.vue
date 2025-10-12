<!---
  Contact information
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div>
    <h4 class="join"> Kontakt </h4>
    <div class="flex flex-row">
      <div class="basis-64">Name</div>
      <div class="basis-128">
        <div>{{ joinStore.gameplay.owner.organisatorName }}</div>
        <div v-if="organisationAvailable">{{ joinStore.gameplay.owner.organisation }}</div>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Email</div>
      <div class="basis-128">
        <a :href="mailtoUrl">{{ joinStore.gameplay.owner.organisatorEmail }}</a>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="basis-64">Telefon</div>
      <div class="basis-128">{{ joinStore.gameplay.owner.organisatorPhone }}</div>
    </div>
  </div>
</template>

<script setup>
import {useJoinStore} from '../store/joinStore';
import {computed} from 'vue';
const joinStore = useJoinStore();

const mailtoUrl=computed(()=> `mailto:${joinStore.gameplay.owner.organisatorEmail}` )
const organisationAvailable=computed(()=> joinStore.gameplay.owner.organisation && joinStore.gameplay.owner.organisation.length > 1 )

</script>

<style scoped lang="scss">
h4.join {
  border-bottom: #ccc;
  border-right: none;
  border-left: none;
  border-top: none;
  border-bottom-width: thin;
  border-bottom-style: solid;
  margin-top: 5px;
}
</style>
