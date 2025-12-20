/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import ReceptionRoot from './components/ReceptionRoot.vue';
import AccountingRoot from './components/accounting/AccountingRoot.vue';
import DashboardRoot from './components/dashboard/DashboardRoot.vue';
import CallRoot from './components/call/CallRoot.vue';
import ChanceRoot from './components/chance/ChanceRoot.vue';
import MapRoot from './components/map/MapRoot.vue';
import PicturesRoot from './components/pictures/PicturesRoot.vue';
import PricelistRoot from './components/pricelist/PricelistRoot.vue';
import RulesRoot from './components/rules/RulesRoot.vue';
import StatisticsRoot from './components/statistics/StatisticsRoot.vue';
import ServiceRoot from './components/service/ServiceRoot.vue';
import StornoRoot from './components/storno/StornoRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: DashboardRoot },
    {path: '/accounting', name: 'accounting', component: AccountingRoot },
    {path: '/call', name: 'call', component: CallRoot },
    {path: '/chance', name: 'chance', component: ChanceRoot },
    {path: '/dashboard', name: 'dashboard', component: DashboardRoot },
    {path: '/map', name: 'map', component: MapRoot },
    {path: '/pictures', name: 'pictures', component: PicturesRoot },
    {path: '/pricelist', name: 'pricelist', component: PricelistRoot },
    {path: '/rules', name: 'rules', component: RulesRoot },
    {path: '/statistics', name: 'statistics', component: StatisticsRoot },
    {path: '/service', name: 'service', component: ServiceRoot },
    {path: '/storno', name: 'storno', component: StornoRoot },
  ],
  components: [
    {name: 'reception-root', component: ReceptionRoot},
  ],
  appMount: '#reception-app',
})

