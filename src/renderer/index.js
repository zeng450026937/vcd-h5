import '../logger/renderer/install';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import rtc from './rtc';
import storage from './storage';
import popup from './popup';
import kom from './kom';
import i18n from './i18n';
import './plugins/ant-design';
import './plugins/electron';
// import updater from './updater';
import { sendReady } from './mainProcessProxy';

Vue.config.productionTip = false;
// updater.checkForUpdates();

const startTime = performance.now();

new Vue({
  mixins : [
    {
      mounted() {
        sendReady(performance.now() - startTime);
      },
    },
  ],
  router,
  kom,
  i18n,
  rtc,
  storage,
  popup,
  render : (h) => h(App),
}).$mount('#app');
