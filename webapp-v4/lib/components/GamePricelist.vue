<!---
  Pricelist created for the game and afterwards, including the game data
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.12.2025
-->

<template>
  <div
      ref="tableContainer"
      class="flex flex-col"
      style="height: 100%; background-color: #4d9be8;"
  >
    <DataTable
        :value="properties"
        class="p-datatable-striped"
        size="small"
        :paginator="props.paginatorEnabled"
        :rows="rowsPerPage"
    >
      <Column
          field="pricelist.position"
          :sortable="true"
          header="Pos."
      >
        <template #body="slotProps">
          <div> {{ slotProps.data.pricelist.position + 1 }}</div>
        </template>
      </Column>
      <Column
          field="location.name"
          :sortable="true"
          header="Ort"
      >
        <template #body="{data}">
          <span
              class="property-group-link"
              @click="onPropertySelected(data)"
          >
            {{ data.location.name }} &nbsp;
          </span>
          <FontAwesomeIcon
              v-if="picturesAvailable(data.uuid)"
              :icon="faCamera"
          />
        </template>
      </Column>
      <Column
          field="pricelist.propertyGroup"
          :sortable="true"
          header="Gruppe"
      >
        <template #body="slotProps">
          <div> {{ slotProps.data.pricelist.propertyGroup }}</div>
        </template>
      </Column>
      <Column
          field="gamedata.ownerName"
          :sortable="true"
          header="Besitzer"
      >
        <template #body="slotProps">
          <div> {{ slotProps.data.gamedata.ownerName }}</div>
        </template>
      </Column>
      <Column
          field="gamedata.buildings"
          :sortable="true"
          header="Status"
      >
        <template #body="slotProps">
          <div>
            <FontAwesomeIcon
                v-if="showHotel(slotProps.data.gamedata.buildings)"
                :icon="faHotel"
            />
            <FontAwesomeIcon
                v-if="showFirstHouse(slotProps.data.gamedata.buildings)"
                :icon="faHouse"
            />
            <FontAwesomeIcon
                v-if="showSecondHouse(slotProps.data.gamedata.buildings)"
                :icon="faHouse"
            />
            <FontAwesomeIcon
                v-if="showThirdHouse(slotProps.data.gamedata.buildings)"
                :icon="faHouse"
            />
            <FontAwesomeIcon
                v-if="showFourthHouse(slotProps.data.gamedata.buildings)"
                :icon="faHouse"
            />
            <FontAwesomeIcon
                v-if="showBuildingEnabled(slotProps.data.gamedata)"
                class="building-enabled"
                :icon="faHouse"
            />

          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import {faHouse, faHotel, faCamera} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

const tableContainer = ref(null);
const rowsPerPage    = ref(10);
let resizeObserver   = null;

const emit = defineEmits(['property-selected']);

/**
 * Represents a list of properties.
 * The variable 'properties' is required and must be defined as an array.
 * By default, if no value is provided, it initializes to an empty array.
 */
const props = defineProps({
  properties:       {
    type:     Array,
    required: true,
    default:  () => []
  },
  paginatorEnabled: {
    type:     Boolean,
    required: false,
    default:  false
  },
  pictures: {
    type:     Array,
    required: true,
    default:  () => []
  }
})

const showFirstHouse      = function (buildings) {
  return (buildings < 5) && (buildings > 0);
}
const showSecondHouse     = function (buildings) {
  return (buildings < 5) && (buildings > 1);
}
const showThirdHouse      = function (buildings) {
  return (buildings < 5) && (buildings > 2);
}
const showFourthHouse     = function (buildings) {
  return (buildings < 5) && (buildings > 3);
}
const showHotel           = function (buildings) {
  return (buildings === 5);
}
const showBuildingEnabled = function (gamedata) {
  return (gamedata.buildingEnabled && (gamedata.buildings < 5) && (gamedata.buildings > -1));
}

const picturesAvailable = function (propertyId) {
  return props.pictures.some(picture => picture.propertyId === propertyId);
}

/**
 * A function to calculate the maximum number of rows that can fit within a given container,
 * based on the height of the container and pre-defined constraints for header, paginator, padding, and row height.
 *
 * Preconditions:
 * - Must be invoked only when `tableContainer.value` is defined.
 * - The layout and sizing assumptions (e.g., space taken by headers, paddings, and row height) must remain consistent.
 *
 * Side-effects:
 * - Modifies the value of `rowsPerPage`.
 * - Outputs a log statement with calculation details.
 */
const calculateRows = () => {
  if (!tableContainer.value) {
    return;
  }

  const containerHeight = tableContainer.value.clientHeight;

  // Estimate: Header (~50px) + Paginator (~64px) + Padding (~20px) = 130px non-row space
  const availableHeight = containerHeight - 37 - 56;
  // Estimate: Row height ~24px for small size
  const calculatedRows  = Math.floor(availableHeight / 37);
  rowsPerPage.value     = Math.max(1, calculatedRows);

  console.log(`Calculated ${rowsPerPage.value} rows for ${availableHeight}px height, containerHeight:${containerHeight}`);
};

const onPropertySelected = function (data) {
  emit('property-selected', data);
}

onMounted(() => {
  calculateRows();
  resizeObserver = new ResizeObserver(() => {
    calculateRows();
  });
  if (tableContainer.value) {
    resizeObserver.observe(tableContainer.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && tableContainer.value) {
    resizeObserver.unobserve(tableContainer.value);
  }
});


</script>

<style scoped lang="scss">
.building-enabled {
  color: lightgrey;
}

.property-group-link {
  color: #3b82f6; // blue color
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: #2563eb; // darker blue on hover
  }
}
</style>
