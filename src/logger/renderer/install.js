import { ipcRenderer } from 'electron';

const __DEV__ = process.env.NODE_ENV === 'development';

const g = global;

/**
 * Dispatches the given log entry to the main process where it will be picked
 * written to all log transports. See initializeWinston in logger.ts for more
 * details about what transports we set up.
 */
function log(level, ...args) {
  // if (__DEV__) {
  console[level](...args);
  // }
  // else {
  ipcRenderer.send(
    'log',
    level,
    ...args,
  );
  // }
}

g.logger = {
  error(...args) {
    log('error', ...args);
  },
  warn(...args) {
    log('warn', ...args);
  },
  info(...args) {
    log('info', ...args);
  },
  debug(...args) {
    log('debug', ...args);
  },
  profile(...args) {
    log('profile', ...args);
  },
};
