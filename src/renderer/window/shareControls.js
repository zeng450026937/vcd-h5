import Vue from 'vue';
import Window from './ShareControls.vue';
import i18n from '../i18n';
import '../plugins/ant-design';
import '../plugins/electron';
import { ShareControlsProxy } from '../proxy/share-controls-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ShareControlsProxy ],
  i18n,
  render : (h) => h(Window),
}).$mount('#window');

export default window;
