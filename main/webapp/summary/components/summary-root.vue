<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 05.03.22
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange")
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false")

    div(v-if="selectedTeamId")
      team-info-root(:team-id="selectedTeamId")
    div(v-if="!selectedTeamId")
      overview-root(v-if="panel==='panel-overview'")
      map-root(v-if="panel==='panel-map'")
      chancellery-view(v-if="panel==='panel-chancellery'")
      summary-pictures-root(v-if="panel==='panel-pictures'")
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import ModalError from '../../common/components/modal-error/modal-error.vue';
import OverviewRoot from './overview/overview-root.vue';
import MapRoot from '../../lib/components/travel-map/map-root.vue';
import ChancelleryView from './overview/chancellery-view.vue';
import TeamInfoRoot from './team-info/team-info-root.vue';
import SummaryPicturesRoot from "./pictures/summary-pictures-root.vue";

export default {
  name      : 'SummaryRoot',
  components: {SummaryPicturesRoot, TeamInfoRoot, ChancelleryView, OverviewRoot, MenuBar, ModalError, MapRoot},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {};
  },
  computed  : {
    ...mapFields({
      menuElements  : 'summary.menuElements',
      panel         : 'summary.panel',
      error         : 'api.error',
      selectedTeamId: 'summary.selectedTeamId'
    }),
    apiErrorActive: {
      get() {
        return this.error.active;
      },
      set() {
        this.$store.commit('resetApiError');
      }
    },
    apiErrorText() {
      return this.error.infoText;
    },
    apiErrorMessage() {
      return this.error.message;
    },
  },
  created   : function () {
  },
  methods   : {
    /**
     * Panel change from menu bar / component
     * @param panel
     */
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.selectedTeamId = undefined;
      this.$store.commit('setPanel', panel);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
