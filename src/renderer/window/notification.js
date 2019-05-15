import Vue from 'vue';
import notification from './notification.vue';
import i18n from '../i18n';
import '../plugins/ant-design';
import '../plugins/electron';
import { NotificationWindowProxy } from '../proxy/notification-window-proxy';

Vue.config.productionTip = false;

const window = new Vue({
  mixins : [ NotificationWindowProxy ],
  i18n,
  render : (h) => h(notification),
}).$mount('#window');

export default window;
