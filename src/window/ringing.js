import Vue from 'vue';
import WindowRinging from './WindowRinging.vue';
import '../renderer/plugins/ant-design';
import '../renderer/plugins/electron';

Vue.config.productionTip = false;

const window = new Vue({
  render : (h) => h(WindowRinging),
}).$mount('#window');

export default window;
