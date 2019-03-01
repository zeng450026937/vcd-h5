import { ipcRenderer } from 'electron';

export function sendWillQuitSync() {
  ipcRenderer.sendSync('will-quit');
}

export function sendCrashQuitSync() {
  ipcRenderer.sendSync('crash-quit');
}

export function getSystemInfo() {
  ipcRenderer.send('request-system-info');

  return new Promise((resolve) => {
    ipcRenderer.once('system-info', (event, arg) => {
      resolve(arg);
    });
  });
}

export function sendNotification(data) {
  ipcRenderer.send('YTMS-notification', data);
}

export function sendCrashReport(data) {
  ipcRenderer.send('render-crash', data);
}
