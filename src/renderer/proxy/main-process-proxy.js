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

export function getTodayLogData(data) {
  ipcRenderer.send('request-today-log-data', data);

  return new Promise((resolve) => {
    ipcRenderer.once('send-log-data', (event, arg) => {
      resolve(arg);
    });
  });
}
