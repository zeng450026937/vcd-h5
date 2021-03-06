import '../logger/renderer/install';
import '../ipc/ipc-proxy';

import Vue from 'vue';
import App from './App.vue';
import i18n from './i18n';
import router from './router';
import kom from './model';
import rtc from './rtc';
import storage from './storage';
import popup from './popup';
import './plugins/ant-design';
import './plugins/electron';
import { AppWindowProxy } from './proxy/app-window-proxy';

Vue.config.productionTip = false;

new Vue({
  mixins : [
    AppWindowProxy,
  ],
  router,
  kom,
  i18n,
  rtc,
  storage,
  popup,
  render : (h) => h(App),
}).$mount('#app');
