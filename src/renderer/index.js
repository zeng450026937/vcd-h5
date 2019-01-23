import Vue from 'vue';
import App from './App.vue';
import './plugins/electron';

Vue.config.productionTip = false;

export default new Vue({
  render : (h) => h(App),
}).$mount('#app');
