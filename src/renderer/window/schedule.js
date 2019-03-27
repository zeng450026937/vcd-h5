import Vue from 'vue';
import '../plugins/ant-design';
import '../plugins/electron';
import { ScheduleWindowProxy } from '../proxy/schedule-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ ScheduleWindowProxy ],
  render : (h) => h('div'),
}).$mount('#window');

export default window;
