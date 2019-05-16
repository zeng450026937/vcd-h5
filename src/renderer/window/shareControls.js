import Vue from 'vue';
import Window from './ShareControls.vue';
import '../plugins/ant-design';
import '../plugins/electron';
import { ShareControlsProxy } from '../proxy/share-controls-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ShareControlsProxy ],
  render : (h) => h(Window),
}).$mount('#window');

export default window;
