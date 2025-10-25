/**
 * The info app
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 25.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import InfoRoot from './components/InfoRoot.vue';
import InfoPricelist from './components/InfoPricelist.vue';
import InfoMap from './components/InfoMap.vue';
import InfoRules from './components/InfoRules.vue';
import InfoGame from './components/InfoGame.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: InfoGame },
    {path: '/preisliste', name: 'pricelist', component: InfoPricelist },
    {path: '/karte', name: 'map', component: InfoMap },
    {path: '/spielregeln', name: 'rules', component: InfoRules },
  ],
  components: [
    {name: 'info-root', component: InfoRoot},
  ],
  appMount: '#info-app',
})

