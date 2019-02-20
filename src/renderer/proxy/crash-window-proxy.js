import { ipcRenderer } from 'electron';

const startTime = performance.now();

export const AppWindowProxy = {
  mounted() {
    ipcRenderer.send('crash-ready', performance.now() - startTime);
  },
};
