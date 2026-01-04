/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import SummaryRoot from './components/SummaryRoot.vue';
import DashboardRoot from './components/dashboard/DashboardRoot.vue';
import PicturesRoot from './components/pictures/PicturesRoot.vue';
import StatisticsRoot from './components/statistics/StatisticsRoot.vue';
import AccountingRoot from './components/accounting/AccountingRoot.vue';
import ChanceRoot from './components/chance/ChanceRoot.vue';
import PricelistRoot from './components/pricelist/PricelistRoot.vue';
import MapRoot from './components/map/MapRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'dashboard', component: DashboardRoot },
    {path: '/map', name: 'map', component: MapRoot },
    {path: '/pictures', name: 'pictures', component: PicturesRoot },
    {path: '/statistics', name: 'statistics', component: StatisticsRoot },
    {path: '/accounting', name: 'accounting', component: AccountingRoot },
    {path: '/chance', name: 'chance', component: ChanceRoot },
    {path: '/pricelist', name: 'pricelist', component: PricelistRoot },
  ],
  components: [
    {name: 'summary-root', component: SummaryRoot},
  ],
  appMount: '#summary-app',
})

