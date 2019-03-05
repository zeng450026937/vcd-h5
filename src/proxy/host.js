import { ipcMain } from 'electron';
import delegates from 'delegates';
import { toIPCName } from './event-names';

export class IPCHost {
  constructor(webContents) {
    this.ipc = ipcMain;
    this.webContents = webContents;

    delegates(this, 'ipc')
      .method('emit')
      .method('removeListerner')
      .method('removeAllListerner');
  }

  send(event, ...args) {
    return this.sendTo(this.webContents, event, ...args);
  }

  sendTo(webContents, event, ...args) {
    return new Promise((resolve, reject) => {
      if (!webContents) throw new Error('Missing webContents');

      const ipcname = toIPCName(event);

      this.ipc.once(ipcname.res, (ret, data) => {
        if (ret) return resolve(data);
        else return reject(data);
      });
  
      webContents.send(ipcname.req, ...args);
    });
  }

  on(event, fn) {
    const ipcname = toIPCName(event);

    this.ipc.on(ipcname.res, async() => {
      fn();
    });
  }

  once(event, fn) {
    this.ipc.once(event, () => {
      fn();
    });
  }
} 
