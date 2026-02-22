<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <h1>Preisliste</h1>
    <data-table
        :value="pricelist"
        size="small"
        striped-rows
        class="mt-3"
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
          <span> {{ data.location.name }} </span>
          <FontAwesomeIcon
              v-if="data.gamedata.owner"
              :icon="faFlag"
              class="owned-property"
          />
        </template>
      </column>
      <column
          field="pricelist.propertyGroup"
          header="Gruppe"
      />
      <column
          field="pricelist.price"
          header="Kaufpreis"
      >
        <template #body="{data}">
          <span>{{ formatPrice(data.pricelist.price) }}</span>
        </template>
      </column>

    </data-table>
  </div>
</template>

<script setup>
import {formatPrice} from '../../../../common/lib/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {computed} from 'vue';
import {faFlag} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

const propertyStore = usePropertyStore();

const pricelist = computed(() => {
  return propertyStore.pricelist;
})
</script>

<style scoped lang="scss">
.owned-property {
  color: red;
}
</style>
