import Vue from 'vue';
import VueAnalytics from 'vue-analytics';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

console.log(process.env.VUE_APP_GA_TOKEN);
Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GA_TOKEN,
  router
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
