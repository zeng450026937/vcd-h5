import { ipcRenderer } from 'electron';
import delegates from 'delegates';

export class IPCHost {
  constructor() {
    this.ipc = ipcRenderer;
    
    delegates(this, 'ipc')
      .method('on')
      .method('once')
      .method('removeListerner')
      .method('removeAllListerner')
      .method('send')
      .method('sendSync')
      .method('sendTo')
      .method('sendToHost');
  }
} 
