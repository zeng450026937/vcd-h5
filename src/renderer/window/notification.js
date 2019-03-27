import Vue from 'vue';
import '../plugins/ant-design';
import '../plugins/electron';
import notification from './notification.vue';
import { NotificationWindowProxy } from '../proxy/notification-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ NotificationWindowProxy ],
  render : (h) => h(notification),
}).$mount('#window');

export default window;
