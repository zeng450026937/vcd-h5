import { ipcRenderer } from 'electron';

export function sendWillQuitSync() {
  ipcRenderer.sendSync('will-quit');
}

export function sendReady(time) {
  ipcRenderer.send('renderer-ready', time);
}
