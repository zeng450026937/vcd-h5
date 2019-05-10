import { ipcRenderer } from 'electron';

export function sendWillQuitSync() {
  ipcRenderer.sendSync('will-quit');
}

export function sendCrashQuitSync() {
  ipcRenderer.sendSync('crash-quit');
}

export function updateTrayMenu(template) {
  
}

export function getLocale() {
  ipcRenderer.send('request-locale');

  return new Promise((resolve) => {
    ipcRenderer.once('request-locale-reply', (event, args) => {
      resolve(args);
    });
  });
}

export function setLocale(lang) {
  ipcRenderer.send('set-locale', lang);

  return new Promise((resolve) => {
    ipcRenderer.once('set-locale-reply', (event, args) => {
      resolve(args);
    });
  });
}

export function restoreWindow() {
  ipcRenderer.send('request-restore-window');
}
