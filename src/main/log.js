import * as Path from 'path';
import * as winston from 'winston';
import { ensureDir } from 'fs-extra';
import getLogDirectoryPath from '../utils/getLogPath';

require('winston-daily-rotate-file');

const MaxLogFiles = 14;

function getLogFilePath(directory) {
  const channel = 'alpha';
  const fileName = `vc-desktop.${channel}.log`;

  
  return Path.join(directory, fileName);
}


function initializeWinston(path) {
  const fileLogger = new winston.transports.DailyRotateFile({
    filename         : path,
    handleExceptions : false,
    json             : false,
    datePattern      : 'YYYY-MM-DD',
    prepend          : true,
    level            : 'debug',
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

export default async function log(level, message) {
  try {
    const logger = await getLogger();

    await new Promise((resolve, reject) => {
      logger(level, message, (error) => {
        if (error) {
          reject(error);
        }
        else {
          console.log('success');
          resolve();
        }
      });
    });
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
