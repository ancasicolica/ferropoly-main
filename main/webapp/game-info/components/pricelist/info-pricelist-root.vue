<!---
  Panel with the pricelist
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.10.21
-->
<template lang="pug">
  div
    div(v-if="finalized")
      h1 {{gamename}}
      pricelist-list(:pricelist="pricelist")
    div(v-if="!finalized")
      b-jumbotron(:header="gamename" lead="Die Preisliste für dieses Spiel ist noch nicht fertig erstellt. Komme später wieder vorbei!" )
        p &nbsp;
</template>

<script>
import PricelistList from '../../../common/components/pricelist/pricelist-list.vue';
import {mapFields} from 'vuex-map-fields';

export default {
  name      : 'InfoPricelistRoot',
  components: {PricelistList},
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      gamename : 'gameplay.gamename',
      finalized: 'gameplay.internal.finalized',
      pricelist: 'register.properties'
    }),
  },
  created   : function () {
  },
  methods   : {},

}
</script>

<style lang="scss" scoped>

</style>
