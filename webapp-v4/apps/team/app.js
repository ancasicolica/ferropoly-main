/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import TeamEditRoot from './components/TeamEditRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: TeamEditRoot }
  ],
  components: [
    {name: 'team-edit-root', component: TeamEditRoot},
  ],
  appMount: '#team-app',
})

