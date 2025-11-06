<!---
  List with all team members
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 04.11.2025
-->

<template>
  <div>
    <ConfirmDialog />
    <ferro-card title="abc">
      <div>
        <TeamMemberEntry
            v-for="m in teamStore.teamMembers"
            :key="m.login"
            :member="m"
            @delete="onDelete"
        />
      </div>
    </ferro-card>
  </div>
</template>

<script setup>
import TeamMemberEntry from './TeamMemberEntry.vue';
import {useTeamStore} from '../store/Team';
import FerroCard from '../../../common/components/FerroCard.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from 'primevue/useconfirm';

const confirm = useConfirm();

const teamStore = useTeamStore();

const onDelete = function (member) {

  confirm.require({
    message:     `Soll ${member.login} wirklich aus dem Team entfernt werden?`,
    header:      'Ferropoly',
    icon:        'pi pi-exclamation-triangle',
    rejectProps: {
      label:    'Nein',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Ja'
    },
    accept:      () => {
      console.log('accept');
      teamStore.removeMember(member.login);
    },
    reject:      () => {
      console.log('reject');
    }
  })
}
</script>

<style scoped lang="scss">

</style>
