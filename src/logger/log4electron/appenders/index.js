/* eslint-disable import/no-extraneous-dependencies */
import configure from '../configure';
import levels from '../levels';
import layouts from '../layouts';

import { throwExceptionIf, not, anObject } from '../utils';

import console from './console';
import browser from './browser';
import stdout from './stdout';
import stderr from './stderr';
import file from './file';

const debug = require('debug')('log4electron:appenders');

const coreAppenders = new Map();
const appenders = new Map();

coreAppenders.set('console', console);
coreAppenders.set('browser', browser);
coreAppenders.set('stdout', stdout);
coreAppenders.set('stderr', stderr);
coreAppenders.set('file', file);

const loadAppenderModule = (type, config) => {
  const appender = coreAppenders.get(type);

  throwExceptionIf(config, not(appender), `you have not register the appender of ${type}`);

  return appender;
};

export const addCoreAppender = (name, config) => {
  coreAppenders.set(name, config);
};

/**
 *
 * @param name
 * @param config
     browser : {
          type   : 'browser',
          layout : {
            type : 'browser',
          },
        },
 * @returns {*}
 */
const createAppender = (name, config) => {
  const appenderConfig = config.appenders[name];
  const appenderModule = loadAppenderModule(appenderConfig.type, config); // 得到 appender

  throwExceptionIf(
    config,
    not(appenderModule),
    `appender "${name}" is not valid (type "${appenderConfig.type}" could not be found)`
  );

  if (appenderModule.appender) {
    debug(`DEPRECATION: Appender ${appenderConfig.type} exports an appender function.`);
  }
  if (appenderModule.shutdown) {
    debug(`DEPRECATION: Appender ${appenderConfig.type} exports a shutdown function.`);
  }

  return appenderModule.configure(
    appenderConfig,
    layouts,
    (appender) => appenders.get(appender),
    levels
  );
};

const setup = (config) => {
  appenders.clear();
  Object.keys(config.appenders).forEach((key) => {
    debug(`creating appender ${key}`);
    appenders.set(key, createAppender(key, config));
  });
};

setup({ appenders: { out: { type: 'stdout' } } });

configure.addListener((config) => {
  throwExceptionIf(
    config,
    not(anObject(config.appenders)),
    'must have a property "appenders" of type object.'
  );
  const appenderNames = Object.keys(config.appenders);

  throwExceptionIf(
    config,
    not(appenderNames.length),
    'must define at least one appender.'
  );
  appenderNames.forEach((name) => {
    throwExceptionIf(
      config,
      not(config.appenders[name].type),
      `appender "${name}" is not valid (must be an object with property "type")`
    );
  });
});

configure.addListener(setup);

export default appenders;
