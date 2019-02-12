import { ipcRenderer } from 'electron';

export function sendWillQuitSync() {
  ipcRenderer.sendSync('will-quit');
}
