import { ipcMain } from 'electron';
import { log } from '../winston';

function createLogger(label = 'browser') {
  return {
    error(...args) {
      log(label, 'error', ...args);
    },
    warn(...args) {
      log(label, 'warn', ...args);
    },
    info(...args) {
      log(label, 'info', ...args);
    },
    debug(...args) {
      log(label, 'debug', ...args);
    },
    profile(...args) {
      log(label, 'profile', ...args);
    },
  };
}

const g = global;

g.logger = createLogger();

const loggerHost = createLogger('renderer');

ipcMain.on(
  'log',
  (event, level, ...args) => {
    const method = loggerHost[level];

    if (method) {
      loggerHost[level](...args);
    }
  }
);
