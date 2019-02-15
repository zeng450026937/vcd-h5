import Vue from 'vue';
import Window from './WindowShareScreen.vue';
import '../renderer/plugins/ant-design';
import '../renderer/plugins/electron';

Vue.config.productionTip = false;

const window = new Vue({
  render : (h) => h(Window),
}).$mount('#window');

export default window;
