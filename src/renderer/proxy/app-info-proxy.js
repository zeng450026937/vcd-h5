import { ipcRenderer } from 'electron';

export function getSystemInfo() {
  ipcRenderer.send('request-system-info');

  return new Promise((resolve) => {
    ipcRenderer.once('system-info', (event, arg) => {
      resolve(arg);
    });
  });
}
