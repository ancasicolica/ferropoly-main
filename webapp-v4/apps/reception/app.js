/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import ReceptionRoot from './components/ReceptionRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: ReceptionRoot },
  ],
  components: [
    {name: 'reception-root', component: ReceptionRoot},
  ],
  appMount: '#reception-app',
})

