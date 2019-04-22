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
    ipcRenderer.on('request-locale-reply', (event, args) => {
      resolve(args);
    });
  });
}
