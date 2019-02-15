import {
  ipcMain,
} from 'electron';
import {
  eventNames,
} from './event-names';

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
