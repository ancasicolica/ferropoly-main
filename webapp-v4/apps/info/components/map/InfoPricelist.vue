<!---
  A very reduced pricelist only for the info purpose
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 14.11.2025
-->

<template>
  <div
      ref="containerRef"
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
            sortable
        >
          <template #body="{data}">
            <span>{{ data.pricelist.position + 1 }}</span>
          </template>
        </column>
        <column
            field="location.name"
            header="Ort"
            sortable
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
            <span
                class="property-group-link"
                @click="onPriceSelected(data.pricelist.price)"
            >
              {{ formatPrice(data.pricelist.price) }}</span>
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
import {computed, ref, onMounted, onUnmounted, defineEmits} from 'vue';
import ScrollPanel from 'primevue/scrollpanel';
import {
  PROPERTY_FILTER_GROUP_NONE,
  PROPERTY_FILTER_PRICE_NONE,
  PROPERTY_FILTER_UUID_NONE
} from '../../../../lib/constants/propertyStoreFilters';

const propertyStore = usePropertyStore();
const emit          = defineEmits(['center-map']);

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

function emitBounds(props) {
  if (props.length > 0) {
    // Initialize with first property's coordinates
    let north = -90, south = 90, east = -180, west = 180;

    props.forEach(property => {
      if (property?.location?.position) {
        const lat = parseFloat(property.location.position.lat);
        const lng = parseFloat(property.location.position.lng);

        north = Math.max(north, lat);
        south = Math.min(south, lat);
        east  = Math.max(east, lng);
        west  = Math.min(west, lng);
      }
    });

    // Emit bounds to parent component
    emit('center-map', {
      bounds: {
        north,
        south,
        east,
        west
      }
    });
  }
}

// Handler for property group selection
const onPropertyGroupSelected = (propertyGroup) => {
  propertyStore.filter.propertyGroup = propertyGroup;
  propertyStore.filter.propertyUuid  = PROPERTY_FILTER_UUID_NONE;
  propertyStore.filter.price         = PROPERTY_FILTER_PRICE_NONE;
  propertyStore.updateFilter();

  const props = propertyStore.propertiesByGroup(propertyGroup);

  emitBounds(props);
};

// Handler for property selection
const onPropertySelected = (uuid) => {
  propertyStore.filter.propertyUuid  = uuid;
  propertyStore.filter.propertyGroup = PROPERTY_FILTER_GROUP_NONE;
  propertyStore.filter.price         = PROPERTY_FILTER_PRICE_NONE;
  propertyStore.updateFilter();

  // Center map on selected property
  const property = propertyStore.properties.get(uuid);
  if (property?.location?.position) {
    // Emit event to parent component to center the map
    emit('center-map', {
      center: {
        lat: parseFloat(property.location.position.lat),
        lng: parseFloat(property.location.position.lng)
      }
    });
  }
};

// Handler for price selection
const onPriceSelected = (price) => {
  propertyStore.filter.price         = price;
  propertyStore.filter.propertyUuid  = PROPERTY_FILTER_UUID_NONE;
  propertyStore.filter.propertyGroup = PROPERTY_FILTER_GROUP_NONE;
  propertyStore.updateFilter();

  const props = propertyStore.propertiesByPrice(parseInt(price));
  emitBounds(props);
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
