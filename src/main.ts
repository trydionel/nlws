import Vue from 'vue';
import VueAnalytics from 'vue-analytics';
import App from './App.vue';
import router from './router';
import store from './store';

// Disable service worker for now... seems to be causing refresh issues
// import './registerServiceWorker';

Vue.config.productionTip = false;

if (process.env.VUE_APP_GA_TOKEN) {
  Vue.use(VueAnalytics, {
    id: process.env.VUE_APP_GA_TOKEN,
    router,
  });
}

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

declare global {
  interface Window {
    app: Vue;
  }
}
window.app = app;
