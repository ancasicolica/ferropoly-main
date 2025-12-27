/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import CheckInRoot from './components/CheckInRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: CheckInRoot },
  ],
  components: [
    {name: 'check-in-root', component: CheckInRoot},
  ],
  appMount: '#checkin-app',
})

