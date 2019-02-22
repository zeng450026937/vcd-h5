import { ipcRenderer } from 'electron';

let startTime = 0;

export const RingingWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('ringing-ready', performance.now() - startTime);
  },
};
