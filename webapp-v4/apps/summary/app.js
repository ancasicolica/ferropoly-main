/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import SummaryRoot from './components/SummaryRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: SummaryRoot },
  ],
  components: [
    {name: 'summary-root', component: SummaryRoot},
  ],
  appMount: '#summary-app',
})

