import Vue from 'vue';
import '../logger';
import App from './App.vue';
import rtc from './rtc';
import popup from './popup';
import i18n from './i18n';
import './plugins/ant-design';
import './plugins/electron';

Vue.config.productionTip = false;

export default new Vue({
  rtc,
  popup,
  i18n,
  render : (h) => h(App),
}).$mount('#app');
