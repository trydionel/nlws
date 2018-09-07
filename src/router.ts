import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Game from './components/Game.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/game'
    },
    {
      path: '/game/:seed?',
      name: 'game',
      component: Game,
      props: true
    },
    {
      path: '/test',
      name: 'test',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "test" */ './views/Test.vue'),
    },
  ],
});
