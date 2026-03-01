/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import CheckInRoot from './components/CheckInRoot.vue';
import CheckInDashboard from './components/dashboard/CheckInDashboard.vue';
import CheckInMap from './components/map/CheckInMap.vue';
import CheckInUpload from './components/upload/CheckInUpload.vue';
import CheckInPictures from './components/pictures/CheckInPictures.vue';
import CheckInProperty from './components/property/CheckInProperty.vue';
import CheckInAccount from './components/account/CheckInAccount.vue';
import CheckInPricelist from './components/pricelist/CheckInPricelist.vue';
import CheckInRules from './components/rules/CheckInRules.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'dashboard', component: CheckInDashboard },
    {path: '/map', name: 'map', component: CheckInMap },
    {path: '/upload', name: 'upload', component: CheckInUpload },
    {path: '/pictures', name: 'pictures', component: CheckInPictures },
    {path: '/property', name: 'property', component: CheckInProperty },
    {path: '/account', name: 'account', component: CheckInAccount },
    {path: '/pricelist', name: 'pricelist', component: CheckInPricelist },
    {path: '/rules', name: 'rules', component: CheckInRules },
  ],
  components: [
    {name: 'check-in-root', component: CheckInRoot},
  ],
  appMount: '#checkin-app',
})

