import {
  ipcRenderer,
} from 'electron';
import {
  eventNames,
} from './event-names';

export class WindowProxy {
  constructor(ns) {
    this.ns = ns;

    eventNames.forEach((event) => {
      ipcRenderer.on(event, (...args) => this.handleEvent(event, ...args));
    });
  }

  handleEvent(event, ...args) {}

  send(event, ...args) {
    ipcRenderer.send(`${this.ns}-${event}`, ...args);
  }

  sendSync(event, ...args) {
    ipcRenderer.sendSync(`${this.ns}-${event}`, ...args);
  }
}
