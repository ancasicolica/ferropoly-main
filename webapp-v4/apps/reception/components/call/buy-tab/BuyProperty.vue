<!---
  A Panel to buy a property
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.11.2025
-->

<template>
  <div>
    <!-- The confirm dialog -->
    <ConfirmDialog group="headless">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
          <div
              class="rounded-full bg-primary text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20"
          >
            <FontAwesomeIcon
                id="confirm-icon"
                :icon="faSackDollar"
            />
          </div>
          <span class="font-bold text-2xl block mb-2 mt-6">{{ message.header }}</span>
          <p class="mb-0">{{ message.message }}</p>
          <div class="flex items-center gap-2 mt-6">
            <Button
                label="Ja, kaufen"
                class="w-64"
                @click="acceptCallback"
            />
            <Button
                label="Nein, abbrechen"
                variant="outlined"
                class="w-64"
                @click="rejectCallback"
            />
          </div>
        </div>
      </template>
    </ConfirmDialog>
    <!-- Panel starts here -->
    <Panel
        header="Liegenschaft kaufen"
        style="height: 100%"
    >
      <div class="search-container">
        <IconField class="search-field">
          <InputIcon class="pi pi-search" />
          <InputText
              v-model="filters['searchText'].value"
              type="text"
              placeholder="Suche..."
          />
        </IconField>
        <Button
            label="Löschen"
            severity="secondary"
            class="clear-button"
            @click="clearSearch"
        />
      </div>
      <scroll-panel
          ref="containerRef"
          :style="{ height: panelHeight }"
      >
        <DataTable
            v-model:filters="filters"
            :value="properties"
            size="small"
            striped-rows
            sort-field="searchText"
            :sort-order="1"
            class="mt-2"
            :show-headers="showHeaders"
            table-style="width:100%"
        >
          <template #empty>
            <div>Die Suche liefert keinen Treffer!</div>
          </template>
          <Column
              field="searchText"
              header="Ort"
          >
            <template #body="slotProps">
              <div> {{ slotProps.data.location.name }}</div>
            </template>
          </Column>
          <Column
              field="price"
              header="Preis"
          >
            <template #body="slotProps">
              <div> {{ formatPrice(slotProps.data.pricelist.price) }}</div>
            </template>
          </Column>
          <Column>
            <template #body="slotProps">
              <Button
                  label="kaufen"
                  size="small"
                  @click="onClickBuy(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </scroll-panel>
    </Panel>
  </div>
</template>

<script setup>
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import ScrollPanel from 'primevue/scrollpanel';

import {onMounted, onUnmounted, ref} from 'vue';
import {formatPrice} from '../../../../../common/lib/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';

import {FilterMatchMode} from '@primevue/core/api';
import {usePropertyStore} from '../../../../../lib/store/PropertyStore';
import {useConfirm} from 'primevue/useconfirm';
import {useReceptionStore} from '../../../store/ReceptionStore';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {faSackDollar} from '@fortawesome/free-solid-svg-icons';

const receptionStore = useReceptionStore();
const propertyStore  = usePropertyStore();
const confirm        = useConfirm();

// Clear the search string
const clearSearch = () => {
  filters.value['searchText'].value = null;
};

// Reference to the container element
const containerRef = ref(null);
const panelHeight  = ref('200px');

// Function to calculate the height
const calculateHeight = () => {
  if (containerRef.value && containerRef.value.$el) {
    const rect            = containerRef.value.$el.getBoundingClientRect();
    const availableHeight = window.innerHeight - rect.top - 20; // 20px bottom margin
    panelHeight.value     = `${Math.max(200, availableHeight)}px`; // Minimum 200px
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

// The properties als own ref - too slow when using them directly from the store as there is a lot of sorting
// (and the values displayed in the list do not change anyway!)
const properties = ref(
    [...propertyStore.properties.values()]
)

// Not showing the headers of the table
const showHeaders = ref(false);

const filters = ref({
  'searchText': {value: null, matchMode: FilterMatchMode.CONTAINS},
})

const onClickBuy = function (prop) {
  console.log('BUY', prop);
  confirm.require({
    group:       'headless',
    header:      'Ort kaufen',
    message:     `Bitte bestätige, dass das Team "${receptionStore.activeCall.team.name}" das Grundstück "${prop.location.name}" kaufen will.`,
    rejectProps: {
      label:    'Abbrechen',
      severity: 'secondary'
    },
    acceptProps: {
      label: 'Ja, kaufen'
    },
    accept:      () => {
      console.log('gekauft');
    },
    reject:      () => {
      console.log('abbruch');
    }
  });
}
</script>

<style scoped lang="scss">
.search-container {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.search-field {
  flex: 1;
  width: 100%;

  :deep(.p-inputtext) {
    width: 100%;
  }
}

.clear-button {
  flex-shrink: 0;
}

#confirm-icon {
  font-size: xxx-large;
}
</style>
