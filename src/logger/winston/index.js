import winston from 'winston';
import { ensureDirSync } from 'fs-extra';
import { getLogDirectoryPath } from '../get-log-path';

require('winston-daily-rotate-file');

const __DEV__ = process.env.NODE_ENV === 'development';

const MaxLogFiles = 14;

export const loggers = winston.loggers;

export function initializeWinston() {
  const logDirectoryPath = getLogDirectoryPath();

  ensureDirSync(logDirectoryPath);

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
}
