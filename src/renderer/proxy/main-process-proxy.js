import { ipcRenderer } from 'electron';

export function sendWillQuitSync() {
  ipcRenderer.sendSync('will-quit');
}

export function sendCrashQuitSync() {
  ipcRenderer.sendSync('crash-quit');
}

export function startYTMSService() {
  ipcRenderer.send('start-ytms-service');

  return new Promise((resolve) => {
    ipcRenderer.once('start-ytms-service-reply', (event, ...args) => {
      resolve(...args);
    });
  });
}

export function getClientId() {
  ipcRenderer.send('get-clientid');

  return new Promise((resolve) => {
    ipcRenderer.once('get-clientid-reply', (event, ...args) => {
      resolve(...args);
    });
  });
}
