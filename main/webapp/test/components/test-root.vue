<!---
  Test on Root Level, every test has to be added here

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 30.04.21
-->
<template lang="pug">
  #test-root
    menu-bar(:elements="menuElements"
      :show-user-box="showUserBox"
      @panel-change="onPanelChange"
      @test-event="onTestEvent"
      help-url="https://www.ferropoly.ch/")
    b-container(fluid=true)
      div(v-if="panel==='top'")
        h1 Ferropoly Component Tests
      test-property-selector(v-if="panel==='propertySelector'")
      test-gambling-controls(v-if="panel==='gamblingControls'")
      test-team-selector(v-if="panel==='teamSelector'")
      test-graph(v-if="panel==='graph'")
      test-reception-pictures(v-if="panel==='pictures'")
</template>

<script>
import MenuBar from '../../common/components/menu-bar/menu-bar.vue';
import {getItem, setString} from '../../common/lib/sessionStorage';
import TestPropertySelector from './test-property-selector.vue';
import TestGamblingControls from './test-gambling-controls.vue';
import TestTeamSelector from './test-team-selector.vue';
import TestGraph from './test-graph.vue';
import TestReceptionPictures from "./test-reception-pictures.vue";

// EASY START
const defaultPanel = getItem('test-panel', 'top');

export default {
  name      : 'TestRoot',
  components: {
    TestReceptionPictures,
    MenuBar,
    TestPropertySelector,
    TestGamblingControls,
    TestTeamSelector,
    TestGraph
  },
  filters   : {},
  model     : {},
  props     : {},
  data      : function () {
    return {
      menuElements: [
        // take care of the Id's as we're accessing them directly
        /* 0 */  {title: 'Hauptfenster', href: '#', event: 'panel-change', eventParam: 'top'},
        /* 1 */  {
          title   : 'Spiel-Components', href: '#', type: 'dropdown',
          elements: [
            {title: 'Property Selector', href: '#', event: 'panel-change', eventParam: 'propertySelector'},
            {title: 'Gambling Controls / Call Log', href: '#', event: 'panel-change', eventParam: 'gamblingControls'},
            {title: 'Team Selector', href: '#', event: 'panel-change', eventParam: 'teamSelector'},
            {title: 'Graph Playground', href: '#', event: 'panel-change', eventParam: 'graph'},
            {title: 'Reception Pictures', href: '#', event: 'panel-change', eventParam: 'pictures'},
          ]
        },
      ],
      panel       : defaultPanel,
      showUserBox : true
    };
  },
  computed  : {},
  created   : function () {
  },
  methods   : {
    onPanelChange(panel) {
      console.log('onPanelChange', panel);
      this.panel = panel;
      setString('test-panel', panel);
    },
    onTestEvent(data) {
      console.log('onTestEvent', data);
    }
  }
}
</script>

<style scoped>

</style>
