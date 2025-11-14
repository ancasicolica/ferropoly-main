<!---
  A very reduced pricelist only for the info purpose
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 14.11.2025
-->

<template>
  <div ref="containerRef"
       class="pricelist-container"
  >
    <ScrollPanel :style="{ height: scrollPanelHeight }">
      <data-table
          :value="pricelist"
          size="small"
      >
        <column
            field="pricelist.position"
            header="Pos"
        >
          <template #body="{data}">
            <span>{{ data.pricelist.position + 1 }}</span>
          </template>
        </column>
        <column
            field="location.name"
            header="Ort"
        >
          <template #body="{data}">
            <span
                class="property-group-link"
                @click="onPropertySelected(data.uuid)"
            >{{ data.location.name }}</span>
          </template>
        </column>
        <column
            field="pricelist.propertyGroup"
            header="Gruppe"
        >
          <template #body="{data}">
            <span
                class="property-group-link"
                @click="onPropertyGroupSelected(data.pricelist.propertyGroup)"
            >{{ formatPrice(data.pricelist.propertyGroup) }}</span>
          </template>
        </column>
        <column
            field="pricelist.price"
            header="Kaufpreis"
        >
          <template #body="{data}">
            <span>{{ formatPrice(data.pricelist.price) }}</span>
          </template>
        </column>
      </data-table>
    </ScrollPanel>
  </div>
</template>

<script setup>
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {formatPrice} from '../../../../common/lib/formatters';
import {computed, ref, onMounted, onUnmounted} from 'vue';
import ScrollPanel from 'primevue/scrollpanel';
import {PROPERTY_FILTER_GROUP_NONE, PROPERTY_FILTER_UUID_NONE} from '../../../../lib/constants/propertyStoreFilters';

const propertyStore = usePropertyStore();

const pricelist = computed(() => [...propertyStore.properties.values()]);

// Reference to the container element
const containerRef      = ref(null);
const scrollPanelHeight = ref('200px');

// Function to calculate the height
const calculateHeight = () => {
  if (containerRef.value) {
    const rect              = containerRef.value.getBoundingClientRect();
    const availableHeight   = window.innerHeight - rect.top - 20; // 20px bottom margin
    scrollPanelHeight.value = `${Math.max(200, availableHeight)}px`; // Minimum 200px
  }
};

// Add resize listener
onMounted(() => {
  calculateHeight();
  window.addEventListener('resize', calculateHeight);
});

// Clean up listener
onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight);
});

// Handler for property group selection
const onPropertyGroupSelected = (propertyGroup) => {
  propertyStore.filter.propertyGroup = propertyGroup;
  propertyStore.filter.propertyUuid  = PROPERTY_FILTER_UUID_NONE;
  propertyStore.updateFilter();
};

// Handler for property selection
const onPropertySelected = (uuid) => {
  propertyStore.filter.propertyUuid  = uuid;
  propertyStore.filter.propertyGroup = PROPERTY_FILTER_GROUP_NONE;
  propertyStore.updateFilter();
};

</script>

<style scoped lang="scss">
.pricelist-container {
  width: 100%;
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
