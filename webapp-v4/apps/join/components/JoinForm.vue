<!---
  The form for joining
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.10.2025
-->

<template>
  <div class="joinForm">
    <h1>Anmeldung</h1>
    <ferropoly-input-text
        v-model="name"
        label="Name deines Teams"
        :zod-result="joinStore.teamNameValidation"
    />
    <ferropoly-input-text
        v-model="organization"
        label="Zu welchem Verein / welcher Organisation gehört ihr?"
        :zod-result="joinStore.teamOrganizationValidation"
    />
    <ferropoly-input-text
        v-model="contactPerson"
        label="Ansprechperson"
        disabled
        validation-icons-disabled
    />
    <ferropoly-input-text
        v-model="contactEmail"
        label="Email-Adresse"
        disabled
        validation-icons-disabled
    />
    <ferropoly-input-text
        v-model="phone"
        label="Deine Telefonnummer"
        :zod-result="joinStore.teamPhoneValidation"
    />
    <ferropoly-text-area
        v-model="remarks"
        label="Bemerkungen"
    />

    <Button
        :label="actionLabel"
        :disabled="formInvalid"
        @click="onJoin"
    />
  </div>
</template>

<script setup>

import FerropolyInputText from '../../../common/components/FerropolyInputText.vue';
import {useJoinStore} from '../store/joinStore';
import {computed} from 'vue';
import FerropolyTextArea from '../../../common/components/FerropolyTextArea.vue';

import Button from 'primevue/button';

const joinStore = useJoinStore();

const name = computed({
  get: () => joinStore.teamInfoEdit.name,
  set: (value) => joinStore.teamInfoEdit.name = value
})

const organization = computed({
  get: () => joinStore.teamInfoEdit.organization,
  set: (value) => joinStore.teamInfoEdit.organization = value
})

const phone = computed({
  get: () => joinStore.teamInfoEdit.phone,
  set: (value) => joinStore.teamInfoEdit.phone = value
})

const remarks = computed({
  get: () => joinStore.teamInfoEdit.remarks,
  set: (value) => joinStore.teamInfoEdit.remarks = value
})

const formInvalid = computed(() => !joinStore.formValidation.success);

const contactPerson = computed(() => `${joinStore.user.personalData.forename} ${joinStore.user.personalData.surname}`)
const contactEmail  = computed(() => joinStore.user.personalData.email)

const actionLabel = computed(() => {
  if (joinStore.teamInfo.registrationDate) {
    return 'Änderungen speichern';
  }
  else {
    return 'Anmelden';
  }
});


const onJoin = async function () {
  console.log('Joining the game');
  await joinStore.joinGame();
}

</script>

<style scoped lang="scss">

.joinForm {
  margin-bottom: 40px;
}
</style>
