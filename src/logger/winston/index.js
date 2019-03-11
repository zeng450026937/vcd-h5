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
    level            : 'info',
    maxFiles         : MaxLogFiles,
  });

  const consoleLogger = new winston.transports.Console({
    level : process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  });


  winston.loggers.add('browser', {
    format : combine(
      label({ label: 'browser' }),
      timestamp(),
      splat(),
      prettyPrint(),
    ),
    transports : [ consoleLogger, fileLogger ],
  });

  winston.loggers.add('renderer', {
    format : combine(
      label({ label: 'renderer' }),
      timestamp(),
      splat(),
      prettyPrint(),
    ),
    transports : [ consoleLogger, fileLogger ],
  });

  winston.configure({
    format : combine(
      label({ label: 'main' }),
      timestamp(),
      splat(),
      prettyPrint(),
    ),
    transports : [ consoleLogger, fileLogger ],
  });

  return winston.log;
}
