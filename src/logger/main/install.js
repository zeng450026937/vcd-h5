import { log } from '../winston';
import { formatLogMessage } from '../format-log-message';

const g = global;

g.logger = {
  error(message, error) {
    log('error', `[${process.type}] ${formatLogMessage(message, error)}`);
  },
  warn(message, error) {
    log('warn', `[${process.type}] ${formatLogMessage(message, error)}`);
  },
  info(message, error) {
    log('info', `[${process.type}] ${formatLogMessage(message, error)}`);
  },
  debug(message, error) {
    log('debug', `[${process.type}] ${formatLogMessage(message, error)}`);
  },
};
