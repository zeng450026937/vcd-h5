/* eslint-disable import/no-extraneous-dependencies */
import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

import { mainWindow } from './window';

autoUpdater.on('update-available', (info) => {
  mainWindow.send('update-available', info);
});
autoUpdater.on('update-not-available', (info) => {
  mainWindow.send('update-unavailable', info);
});
autoUpdater.on('error', (err) => {
  mainWindow.send('update-error', err);
});
autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.send('update-progress', progressObj);
});
autoUpdater.on('update-downloaded', (info) => {
  mainWindow.send('update-finished', info);
});

ipcMain.on('updater-check-update', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.on('updater-update', () => {
  console.warn('updater-update');
  autoUpdater.checkForUpdatesAndNotify();
});


ipcMain.on('updater-install', () => {
  autoUpdater.quitAndInstall(true, true);
});
