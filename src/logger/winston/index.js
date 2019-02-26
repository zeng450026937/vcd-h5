import Path from 'path';
import winston from 'winston';
import { ensureDir } from 'fs-extra';
import { app } from 'electron';
import { getLogDirectoryPath } from '../get-log-path';

require('winston-daily-rotate-file');

const MaxLogFiles = 14;

function getLogFilePath(directory) {
  const channel = 'alpha';
  const fileName = `vc-desktop-${channel}-%DATE%.log`;

  return Path.join(directory, fileName);
}


function initializeWinston(path) {
  const fileLogger = new winston.transports.DailyRotateFile({
    filename         : path,
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

  winston.configure({
    transports : [ consoleLogger, fileLogger ],
  });

  return winston.log;
}
let loggerPromise;

function getLogger() {
  if (loggerPromise) {
    return loggerPromise;
  }

  loggerPromise = new Promise((resolve, reject) => {
    const logDirectory = getLogDirectoryPath();

    ensureDir(logDirectory)
      .then(() => {
        try {
          console.log(getLogFilePath(logDirectory));
          const logger = initializeWinston(getLogFilePath(logDirectory));

          resolve(logger);
        }
        catch (err) {
          reject(err);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

  return loggerPromise;
}

export async function log(level, message) {
  try {
    const logger = await getLogger();

    logger(level, message);
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
