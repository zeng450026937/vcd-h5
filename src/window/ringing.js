import Vue from 'vue';
import WindowRinging from './WindowRinging.vue';
import '../renderer/plugins/ant-design';
import '../renderer/plugins/electron';
import { RingingWindowProxy } from '../renderer/proxy/ringing-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ RingingWindowProxy ],
  render : (h) => h(WindowRinging),
}).$mount('#window');

export default window;
