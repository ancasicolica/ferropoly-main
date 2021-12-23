<!---
  Root Element of the reception
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 11.12.21
-->
<template lang="pug">
  div
    menu-bar(:elements="menuElements"
      show-user-box=false
      @panel-change="onPanelChange"
      :help-url="helpUrl"
      show-online-status=true
      :online="online")
    modal-error(
      :visible="apiErrorActive"
      title="Fehler"
      :info="apiErrorText"
      :message="apiErrorMessage"
      @close="apiErrorActive=false"
    )
    overview-root(v-if="panel==='panel-overview'")
    accounting-root(v-if="panel==='panel-accounting'")

</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue'
import ModalError from '../../common/components/modal-error/modal-error.vue';
import {mapFields} from 'vuex-map-fields';
import OverviewRoot from './overview/overview-root.vue';
import AccountingRoot from './accounting/accounting-root.vue';

export default {
  name      : 'ReceptionRoot',
  components: {MenuBar, ModalError, OverviewRoot, AccountingRoot},
  filters   : {},
  mixins    : [],
  model     : {},
  props     : {},
  data      : function () {
    return {
      menuElements: [
        {title: 'Übersicht', href: '#', event: 'panel-change', eventParam: 'panel-overview'},
        {title: 'Anruf behandeln', href: '#', event: 'panel-change', eventParam: 'panel-call'},
        {title: 'Karte', href: '#', event: 'panel-change', eventParam: 'panel-map'},
        {title: 'Statistik', href: '#', event: 'panel-change', eventParam: 'panel-statistic'},
        {title: 'Kontobuch', href: '#', event: 'panel-change', eventParam: 'panel-accounting'},
        {title: 'Chance/Kanzlei', href: '#', event: 'panel-change', eventParam: 'panel-chance'},
        {title: 'Preisliste', href: '#', event: 'panel-change', eventParam: 'panel-pricelist'},
        {title: 'Spielregeln', href: '#', event: 'panel-change', eventParam: 'panel-rules'}
      ],
      helpUrls    : {
        'panel-overview'  : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-call'      : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-map'       : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-statistic' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-accounting': 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-chance'    : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-pricelist' : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/',
        'panel-rules'     : 'https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/'
      }
    };
  },
  computed  : {
    ...mapFields([
      'panel',
      'online',
      'gameplay.owner.organisatorName',
      'api.error'
    ]),
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

    helpUrl: {
      get() {
        return this.helpUrls[this.panel];
      }
    }
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
      this.panel = panel;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>