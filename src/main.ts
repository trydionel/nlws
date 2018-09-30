import Vue from 'vue';
import VueAnalytics from 'vue-analytics';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GA_TOKEN,
  router
});

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

window.app = app;