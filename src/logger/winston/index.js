import winston from 'winston';
import { ensureDir } from 'fs-extra';
import { getLogDirectoryPath } from '../get-log-path';

require('winston-daily-rotate-file');

const __DEV__ = process.env.NODE_ENV === 'development';

const MaxLogFiles = 14;

let loggerPromise;

function initializeWinston() {
  if (loggerPromise) {
    return loggerPromise;
  }

  const logDirectoryPath = getLogDirectoryPath();

  loggerPromise = ensureDir(logDirectoryPath)
    .then(() => {
      const { combine, timestamp, colorize, prettyPrint, simple, splat, logstash, label } = winston.format;

      const fileLogger = new winston.transports.DailyRotateFile({
        dirname          : logDirectoryPath,
        filename         : 'vc-desktop.%DATE%.log',
        handleExceptions : false,
        json             : false,
        datePattern      : 'YYYY-MM-DD',
        prepend          : true,
        maxFiles         : MaxLogFiles,
        level            : 'info',
        format           : prettyPrint(),
      });

      const consoleLogger = new winston.transports.Console({
        level  : __DEV__ ? 'debug' : 'error',
        format : prettyPrint(),
      });

      const httpLogger = new winston.transports.Http({
        host  : process.env.VUE_APP_ES_HOST,
        port  : process.env.VUE_APP_LOGSTASH_PORT,
        level : 'info',
      });

      const transports = [
        consoleLogger, fileLogger,
      ];

      if (!__DEV__) {
        transports.push(httpLogger);
      }

      winston.loggers.add('browser', {
        format : combine(
          label({ label: 'browser' }),
          timestamp(),
          splat(),
        ),
        transports,
      });

      winston.loggers.add('renderer', {
        format : combine(
          label({ label: 'renderer' }),
          timestamp(),
          splat(),
        ),
        transports,
      });

      winston.configure({
        format : combine(
          label({ label: 'main' }),
          timestamp(),
          splat(),
        ),
        transports,
      });

      return winston.log;
    });

  return loggerPromise;
}

export async function log(label, level, ...args) {
  let logger;

  try {
    await initializeWinston();

    logger = winston.loggers.get(label) || winston;

    logger[level](...args);
  }
  catch (error) {
    /**
     * Welp. I guess we have to ignore this for now, we
     * don't have any good mechanisms for reporting this.
     * In the future we can discuss whether we should
     * IPC to the renderer or dump it somewhere else
     * but for now logging isn't a critical thing.
     */
  }
}
