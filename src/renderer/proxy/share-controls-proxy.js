import { ipcRenderer } from 'electron';

let startTime = 0;

export const ShareControlsProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  mounted() {
    ipcRenderer.send('share-controls-ready', performance.now() - startTime);
  },
};
