import { ipcRenderer } from 'electron';

let startTime = 0;

export const ShareWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('screen-share-ready', performance.now() - startTime);
  },
};
