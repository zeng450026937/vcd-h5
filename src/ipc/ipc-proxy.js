import { remote } from 'electron';

window.ipcProxy = remote.getGlobal('ipcHost');
