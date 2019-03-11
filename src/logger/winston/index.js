import winston from 'winston';
import { ensureDirSync } from 'fs-extra';
import { getLogDirectoryPath } from '../get-log-path';

require('winston-daily-rotate-file');

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
    level  : process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    format : prettyPrint(),
  });

  const httpLogger = new winston.transports.Http({
    host  : process.env.VUE_APP_ES_HOST,
    port  : process.env.VUE_APP_LOGSTASH_PORT,
    level : 'info',
  });


  winston.loggers.add('browser', {
    format : combine(
      label({ label: 'browser' }),
      timestamp(),
      splat(),
    ),
    transports : [ consoleLogger, fileLogger, httpLogger ],
  });

  winston.loggers.add('renderer', {
    format : combine(
      label({ label: 'renderer' }),
      timestamp(),
      splat(),
    ),
    transports : [ consoleLogger, fileLogger, httpLogger ],
  });

  winston.configure({
    format : combine(
      label({ label: 'main' }),
      timestamp(),
      splat(),
    ),
    transports : [ consoleLogger, fileLogger, httpLogger ],
  });

  return winston.log;
}
