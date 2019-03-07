import Vue from 'vue';
import Window from './WindowShareScreen.vue';
import '../plugins/ant-design';
import '../plugins/electron';
import { ShareWindowProxy } from '../proxy/share-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ShareWindowProxy ],
  render : (h) => h(Window),
}).$mount('#window');

export default window;
