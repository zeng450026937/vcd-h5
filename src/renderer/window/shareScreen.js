import Vue from 'vue';
import Window from './WindowShareScreen.vue';
import i18n from '../i18n';
import '../plugins/ant-design';
import '../plugins/electron';
import { ShareWindowProxy } from '../proxy/share-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ShareWindowProxy ],
  i18n,
  render : (h) => h(Window),
}).$mount('#window');

export default window;
