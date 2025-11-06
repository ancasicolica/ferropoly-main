<!---
  An Entry for a team Member
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 06.11.2025
-->

<template>
  <div>

    <div class="flex mb-3">
      <i
          class="pi pi-trash flex-none mr-2"
          @click="onDeleteRequest"
      />
      <div class="flex-1">{{ member.login }}</div>
      <div
          v-if="member.personalData"
          class="flex-1"
      >
        {{ member.personalData.forename }} {{ member.personalData.surname }}
      </div>
      <div
          v-if="!member.personalData"
          class="flex-1 no-login"
      >
        Diese Person hat kein Login
      </div>
    </div>
  </div>

</template>

<script setup>
// Props definition
const props = defineProps({
  member: {
    type:     Object,
    required: true,
    default:  () => {
      return {}
    }
  }
});

const emit = defineEmits(['delete']);


// Methods
const onDeleteRequest = () => {
  console.log('delete');
  emit('delete', props.member);
};

</script>

<style scoped lang="scss">

.pi-trash {
  cursor: pointer;

  &:hover {
    color: #dc3545;
  }
}

.no-login {
  color: red;
}

</style>
