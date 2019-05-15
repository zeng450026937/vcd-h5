/* eslint-disable import/no-extraneous-dependencies */
import { cloneDeep } from 'lodash';
import configure from './configure';
import appenders from './appenders';
import categories from './categories';
import Logger, { listeners } from './logger';
import layouts from './layouts';
import LogLevel from './levels';

const debug = require('debug')('log4electron:main');

let enabled = false;


const sendLogEventToAppender = (logEvent) => {
  if (!enabled) return;

  const categoryAppenders = categories.appendersForCategory(logEvent.categoryName);

  categoryAppenders.forEach((appender) => {
    appender(logEvent);
  });
};

const loadConfigure = (config) => {
  configure.configure(cloneDeep(config));
  listeners.push(sendLogEventToAppender);
  enabled = true;
};

const getLogger = (category = 'default') => {
  if (!enabled) {
    loadConfigure(process.env.LOG4ELECTRON_CONFIG || {
      appenders  : { out: { type: 'stdout' } },
      categories : { default: { appenders: [ 'out' ], level: 'OFF' } },
    });
  }

  return new Logger(category);
};

const shutdown = (callback) => {
  debug('shutdown is running ...');

  enabled = false;

  const appendersToCheck = Array.from(appenders.values());
  const shutdownFunctions = appendersToCheck.reduceRight((comp, next) => (next.shutdown ? comp + 1 : comp), 0);

  let completed = 0;

  let error;

  const complete = (err) => {
    error = error || err;
    completed += 1;
    debug(`Appenders shutdowns complete: ${completed} / ${shutdownFunctions}`);
    if (completed >= shutdownFunctions) {
      debug('shutdown finished.');
      callback(error);
    }
  };

  if (shutdownFunctions === 0) {
    debug('no appenders to shutdown');

    return callback();
  }
  appendersToCheck.filter((a) => a.shutdown).forEach((a) => a.shutdown(complete));

  return null;
};

const log4electron = {
  getLogger,
  loadConfigure,
  shutdown,
  LogLevel,
  addLayout : layouts.addLayout,
};

export default log4electron;
