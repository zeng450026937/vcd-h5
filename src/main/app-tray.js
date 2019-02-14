import { app, Menu, ipcMain, BrowserWindow, shell, Tray } from 'electron';
import { EventEmitter } from 'events';
import Path from 'path';

export class AppTray extends EventEmitter {
  constructor() {
    super();

    this.tray = null;
    this.template = [];

    this.tray = new Tray(Path.resolve(__public, 'favicon.png'));

    const separator = {
      type : 'separator',
    };

    this.template.push({
      label : '加入会议',
      role  : 'join',
      click : () => {},
    });

    this.template.push(separator);

    this.template.push({
      label : '显示主面板',
      role  : 'restore',
      click : () => {},
    });

    this.template.push(separator);

    this.template.push({
      label : '注销',
      role  : 'logout',
      click : () => {},
    });

    this.template.push({
      label : '退出',
      role  : 'quit',
    });

    const contextMenu = Menu.buildFromTemplate(this.template);
  
    this.tray.setToolTip(process.env.VUE_APP_TITLE);
    this.tray.setContextMenu(contextMenu);
  }

  onClick(fn) {
    if (!fn) return;
    this.tray.on('click', fn);
  } 
}
