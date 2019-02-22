import Vue from 'vue';
import Window from './WindowShareScreen.vue';
import '../renderer/plugins/ant-design';
import '../renderer/plugins/electron';
import { ShareWindowProxy } from '../renderer/proxy/share-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ShareWindowProxy ],
  render : (h) => h(Window),
}).$mount('#window');

export default window;
