import {
  ipcMain,
  ipcRenderer,
} from 'electron';
import {
  eventNames,
} from './event-names';

function IPCHost() {}

eventNames.forEach((event) => {
  IPCHost.prototype.event = () => {};
  ipcMain.on(event, (...args) => this.handleEvent(event, ...args));
});

export class WindowHost {
  constructor(ns) {
    this.ns = ns;
    this.window = null;

    eventNames.forEach((event) => {
      ipcMain.on(event, (...args) => this.handleEvent(event, ...args));
    });
  }

  handleEvent(event, ...args) {
  }

  send(event, ...args) {
    if (!this.window || !this.window.webContents) return;
    this.window.webContents.send(event, ...args);
  }
}
