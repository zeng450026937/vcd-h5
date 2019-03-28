import { ipcRenderer } from 'electron';

let startTime = 0;

export const NotificationWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('notification-ready', performance.now() - startTime);
  },
};
