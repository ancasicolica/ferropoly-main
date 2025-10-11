/**
 * The game selctor app for the game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 06.10.2025
 *
 **/
import createWebApp from '../../common/lib/appFactory';
import GameSelectorRoot from './components/GameSelectorRoot.vue';

createWebApp( {
  routes: [
    {path: '/', name: 'root', component: GameSelectorRoot },
    {path: '/new-game', name: 'new-game', beforeEnter() { location.href='www.ferropoly.ch'}},
    {path: '/dashboard', name: 'dashboard', redirect:'www.nzz.ch'},
  ],
  components: [
    {name: 'game-selector-root', component: GameSelectorRoot},
  ],
  appMount: '#game-selector-app',
})

