/**
 * Web app for the reception
 * 11.12.2021 KC
 */
import Vue from 'vue';
import {BootstrapVue} from 'bootstrap-vue';
import $ from 'jquery';
import VueRouter from 'vue-router';
import store from './store';

// Font Awesome Part
// See: https://github.com/FortAwesome/vue-fontawesome
// Icons:
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(faExclamationCircle); // not used yet
Vue.component('FontAwesomeIcon', FontAwesomeIcon);


// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// Import components
import ReceptionRoot from './components/reception-root.vue';

Vue.use(VueRouter);

Vue.component('ReceptionRoot', ReceptionRoot);

console.log('Webapp initializing');

// Ferropoly Style!
import '../common/style/app.scss';
import {last, split} from 'lodash';
import {getStaticData} from '../lib/adapter/staticData';
import {get} from 'lodash';
import {FerropolySocket} from '../lib/ferropolySocket';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);


/**
 * Startpoint of the app
 */
$(document).ready(function () {
  console.log('DOM ready');
  new Vue({
    el     : '#reception-app',
    created: function () {
      console.log('created');
      // Retrieve GameId for this page
      const elements = split(window.location.pathname, '/');
      let gameId     = last(elements);
      // Load the game data and connect to the ferropoly socket.
      // Still unclear if this is the best place to do so, we'll see.
      getStaticData(gameId, (err, data) => {
        // Set the static data
        this.$store.dispatch({type: 'fetchStaticData', err, data});
        this.$store.dispatch({type:'updateProperties'});
        this.$store.dispatch({type: 'fetchPictures', gameId});
        let authToken = get(data, 'authToken', 'none');
        console.log(`Static data says we have authToken ${authToken}`)
        // Connect to Ferropoly Instance
        this.fsocket = new FerropolySocket({
          url      : get(data, 'socketUrl', '/'),
          authToken: authToken,
          user     : get(data, 'user', 'none'),
          gameId   : gameId,
          store    : this.$store
        });
        this.$store.dispatch({type: 'fetchRankingList'});
        this.$store.dispatch({type: 'updateTeamAccountEntries'});
        this.$store.dispatch({type: 'updateTravelLog'});

      })
    },
    store  : store
  });
});
