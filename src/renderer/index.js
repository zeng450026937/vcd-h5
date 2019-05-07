import '../logger/renderer/install';
import '../ipc/ipc-proxy';

import Vue from 'vue';
import i18n from './i18n';
import App from './App.vue';
import router from './router';
import rtc from './rtc';
import storage from './storage';
import kom from './model';
import popup from './popup';
import './plugins/ant-design';
import './plugins/electron';
import { AppWindowProxy } from './proxy/app-window-proxy';

Vue.config.productionTip = false;

new Vue({
  mixins : [
    AppWindowProxy,
  ],
  i18n,
  router,
  kom,
  rtc,
  storage,
  popup,
  render : (h) => h(App),
}).$mount('#app');
