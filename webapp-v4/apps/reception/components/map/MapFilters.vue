<!---
  Filters for the map
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 13.11.2025
-->

<template>
  <div class="ferropoly-container">
    <div>
      <h3>Filter</h3>
      <div class="mb-2">
        <RadioButton
            v-model="propertyStore.filter.propertyStatus"
            input-id="all"
            :value="PROPERTY_FILTER_STATUS_ALL"
            @update:model-value="onFilterUpdate"
        />
        <label
            for="all"
            class="ml-2"
        >Alle
        </label>
      </div>
      <div class="mb-2">
        <RadioButton
            v-model="propertyStore.filter.propertyStatus"
            input-id="free"
            :value="PROPERTY_FILTER_STATUS_FREE"
            @update:model-value="onFilterUpdate"
        />
        <label
            for="free"
            class="ml-2"
        >Nur freie Orte
        </label>
      </div>
      <div class="mb-2">
        <RadioButton
            v-model="propertyStore.filter.propertyStatus"
            input-id="bought"
            :value="PROPERTY_FILTER_STATUS_BOUGHT"
            @update:model-value="onFilterUpdate"
        />
        <label
            for="bought"
            class="ml-2"
        >Nur gekaufte Orte
        </label>
      </div>
    </div>
    <div>
      <h4>Teams</h4>
      <div class="mb-2">
        <Checkbox
            v-model="allTeams"
            :indeterminate="indeterminate"
            binary
            input-id="allTeams"
            :disabled="teamCheckboxDisabled"
            @update:model-value="onFilterUpdate"
        />
        <label
            class="ml-2"
            for="allTeams"
        >Alle Teams
        </label>
      </div>
      <div
          v-for="team in teamStore.teams"
          :key="team.uuid"
          class="mb-2"
      >
        <Checkbox
            v-model="propertyStore.filter.teams"
            class="mr-2"
            name="team"
            :value="team.uuid"
            :input-id="team.uuid"
            :disabled="teamCheckboxDisabled"
            @update:model-value="onFilterUpdate"
        />
        <FontAwesomeIcon
            :icon="faHome"
            :style="{ color: teamStore.idToColor(team.uuid) }"
        />
        <label
            :for="team.uuid"
            class="ml-1"
        >
          <i class="fa-solid fa-house" />
          {{ team.data.name }} </label>
      </div>
    </div>
    <div>
      <h3>Darstellung</h3>
      <Checkbox
          v-model="propertyStore.showMarkersAsCategory"
          binary
          input-id="presentation"
          @update:model-value="onFilterUpdate"
      />
      <label
          class="ml-2"
          for="presentation"
      > Freie Orte nach Erreichbarkeit
      </label>
    </div>
  </div>
</template>

<script setup>
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {computed} from 'vue';
import {
  PROPERTY_FILTER_STATUS_ALL,
  PROPERTY_FILTER_STATUS_BOUGHT,
  PROPERTY_FILTER_STATUS_FREE
} from '../../../../lib/constants/propertyStoreFilters';

const teamStore     = useTeamsStore();
const propertyStore = usePropertyStore();

const teamCheckboxDisabled = computed(() => {
  return propertyStore.filter.propertyStatus === PROPERTY_FILTER_STATUS_FREE;
})

function onFilterUpdate() {
  console.log('Filter updated', propertyStore.filter.propertyStatus);
  propertyStore.updateFilter();
}

const indeterminate = computed(() => {
  return propertyStore.filter.teams.length > 0 && propertyStore.filter.teams.length !== teamStore.teams.length
})

const allTeams = computed({
  set(val) {
    if (val) {
      selectAllTeams();
    } else {
      clearAllTeams();
    }
  },
  get: () => {
    if (propertyStore.filter.teams.length === teamStore.teams.length) {
      return true;
    } else if (propertyStore.filter.teams.length === 0) {
      return 0;
    }
    return undefined;
  }
})

function selectAllTeams() {
  propertyStore.filter.teams = [];
  for (const team of teamStore.teams) {
    propertyStore.filter.teams.push(team.uuid);
  }
}

function clearAllTeams() {
  propertyStore.filter.teams = [];
}

</script>

<style scoped lang="scss">

</style>
