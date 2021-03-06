import { ipcRenderer } from 'electron';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('crash-ready', performance.now() - startTime);
  },
};
