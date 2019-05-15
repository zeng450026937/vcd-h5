import Vue from 'vue';
import i18n from '../i18n';
import WindowRinging from './WindowRinging.vue';
import '../plugins/ant-design';
import '../plugins/electron';
import { RingingWindowProxy } from '../proxy/ringing-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ RingingWindowProxy ],
  i18n,
  render : (h) => h(WindowRinging),
}).$mount('#window');

export default window;
