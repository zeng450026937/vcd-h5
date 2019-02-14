import { ipcRenderer } from 'electron';
import { formatLogMessage } from '../format-log-message';

const g = global;

/**
 * Dispatches the given log entry to the main process where it will be picked
 * written to all log transports. See initializeWinston in logger.ts for more
 * details about what transports we set up.
 */
function log(level, message, error) {
  ipcRenderer.send(
    'log',
    level,
    formatLogMessage(`[${process.type}] ${message}`, error)
  );
}

g.logger = {
  error(message, error) {
    log('error', message, error);
    console.error(formatLogMessage(message, error));
  },
  warn(message, error) {
    log('warn', message, error);
    console.warn(formatLogMessage(message, error));
  },
  info(message, error) {
    log('info', message, error);
    console.info(formatLogMessage(message, error));
  },
  debug(message, error) {
    log('debug', message, error);
    console.debug(formatLogMessage(message, error));
  },
};
