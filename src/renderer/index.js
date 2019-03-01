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
import { AppWindowProxy } from './proxy/app-window-proxy';

/*
*  在渲染进程 测试 YTMS 接口时序
* */
// import ClientManagement from '../api-service/clientManagement';
// import { getSystemInfo } from './proxy/main-process-proxy';
//
// let clientManagement;
//
// getSystemInfo().then((systemInfo) => {
//   clientManagement = new ClientManagement(systemInfo);
// });

Vue.config.productionTip = false;


// const options = { duration: 2000 };
//
// Vue.directive('long-press', {
//   bind(el, binding) {
//     const self = this;
//
//     this._timeout = null;
//     this._onmouseup = function() {
//       clearTimeout(self._timeout);
//     };
//
//     this._onmousedown = function(e) {
//       const context = this;
//
//       self._timeout = setTimeout(() => {
//         binding.value.call(context, e);
//       }, options.duration);
//     };
//
//     el.addEventListener('mousedown', this._onmousedown);
//     document.addEventListener('mouseup', this._onmouseup);
//   },
//   unbind(el) {
//     clearTimeout(this._timeout);
//     el.removeEventListener('mousedown', this._onmousedown);
//     document.removeEventListener('mouseup', this._onmouseup);
//   },
// });

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
