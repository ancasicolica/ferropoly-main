/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import JoinRoot from './components/JoinRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: JoinRoot },
  ],
  components: [
    {name: 'join-root', component: JoinRoot},
  ],
  appMount: '#join-app',
})

