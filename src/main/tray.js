/* eslint-disable import/no-extraneous-dependencies */
import { app, BrowserWindow, Menu, Tray } from 'electron';
/* eslint-enable import/no-extraneous-dependencies */
import path from 'path';
import { mainWindow } from './window';

let mainTray;

app.on('ready', () => {
  mainTray = new Tray(path.resolve(__public, 'favicon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      role  : 'reload',
      click : () => {
        const all = BrowserWindow.getAllWindows();

        all.forEach((target) => {
          target.webContents.reload();
        });
      },
    },
    {
      role  : 'forcereload',
      click : () => {
        const all = BrowserWindow.getAllWindows();

        all.forEach((target) => {
          target.webContents.reloadIgnoringCache();
        });
      },
    },
    {
      role  : 'toggledevtools',
      click : () => {
        const all = BrowserWindow.getAllWindows();

        all.forEach((target) => {
          target.webContents.toggleDevTools();
        });
      },
    },
    {
      role : 'quit',
    },
  ]);

  mainTray.setToolTip(process.env.VUE_APP_TITLE);
  mainTray.setContextMenu(contextMenu);
  mainTray.on('click', () => {
    if (!mainWindow.isVisible()) mainWindow.show();
  });
});
