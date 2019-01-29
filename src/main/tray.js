/* eslint-disable import/no-extraneous-dependencies */
import { app, BrowserWindow, Menu, Tray } from 'electron';
/* eslint-enable import/no-extraneous-dependencies */
import path from 'path';
import { getMainWindow } from './window';

let mainTray;

function restoreWindow() {
  const mainWindow = getMainWindow();

  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}

app.on('ready', () => {
  mainTray = new Tray(path.resolve(__public, 'favicon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label : '加入会议',
      role  : 'join',
      click : () => {},
    },
    {
      type : 'separator',
    },
    {
      label : '显示主面板',
      role  : 'restore',
      click : restoreWindow,
    },
    {
      type : 'separator',
    },
    {
      label : '注销',
      role  : 'logout',
      click : () => {},
    },
    {
      label : '退出',
      role  : 'quit',
    },
  ]);
  
  mainTray.setToolTip(process.env.VUE_APP_TITLE);
  mainTray.setContextMenu(contextMenu);
  mainTray.on('click', restoreWindow);
});
