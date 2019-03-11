import '../logger/renderer/install';
import '../ipc/ipc-proxy';

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
import './updater';
import { AppWindowProxy } from './proxy/app-window-proxy';

Vue.config.productionTip = false;

Vue.directive('number-only', {
  bind(el) {
    el.handler = function() {
      el.value = el.value.replace(/\D+/, '');
    };
    el.addEventListener('input', el.handler);
  },
  unbind(el) {
    el.removeEventListener('input', el.handler);
  },
});

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
