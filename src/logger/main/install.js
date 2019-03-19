import { ipcMain } from 'electron';
import { initializeWinston, loggers } from '../winston';

initializeWinston();

const g = global;

g.logger = loggers.get('browser');

const loggerHost = loggers.get('renderer');

ipcMain.on(
  'log',
  (event, level, ...args) => {
    const log = loggerHost[level];

    if (log) {
      log(...args);
    }
  }
);

ipcMain.on(
  'profile',
  (event, name) => {
    loggerHost.profile(name);
  }
);
