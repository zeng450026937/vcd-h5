/* eslint-disable import/no-extraneous-dependencies */
import LoggingEvent from './logging-event';
import LogLevel from './levels';
import categories from './categories';
import configure from './configure';

const debug = require('debug')('log4electron:logger');

export const listeners = [];

export const sendToListeners = (logEvent) => {
  listeners.forEach((l) => l(logEvent));
};


class Logger {
  constructor(category = 'default') {
    this.category = category;
    this.context = {};
  }

  get level() {
    return LogLevel.getLevel(categories.getLevelForCategory(this.category), LogLevel.TRACE);
  }

  set level(level) {
    categories.setLevelForCategory(this.category, LogLevel.getLevel(level, this.level));
  }

  log(level, ...data) {
    const logLevel = LogLevel.getLevel(level, LogLevel.INFO);

    if (this.isLevelEnabled(logLevel)) {
      debug(`sending log of ${data} to appenders`);
      const loggingEvent = new LoggingEvent(this.category, logLevel, data, this.context);

      sendToListeners(loggingEvent);
    }
  }

  isLevelEnabled(otherLevel) {
    return this.level.isLessThanOrEqualTo(otherLevel);
  }

  addContext(key, value) {
    this.context[key] = value;
  }

  removeContext(key) {
    Reflect.deleteProperty(this.context, key);
  }

  clearContext() {
    this.context = {};
  }
}

const addLevelMethods = (target) => {
  const level = LogLevel.getLevel(target);

  const levelContentLower = level.toString().toLowerCase();

  debug(`[levelContentLower]: ${levelContentLower}`);
  const levelMethod = levelContentLower.replace(/_([a-z]])/g, (g) => g[1].toUpperCase());

  debug(`[levelMethod]: ${levelMethod}`);
  const isLevelMethod = levelMethod[0].toUpperCase() + levelMethod.slice(1);

  debug(`[isLevelMethod]: ${isLevelMethod}`);


  Logger.prototype[`is${isLevelMethod}Enabled`] = function() {
    return this.isLevelEnabled(level);
  };

  Logger.prototype[levelMethod] = function(...args) {
    this.log(level, ...args);
  };
};

LogLevel.levels.forEach(addLevelMethods);

configure.addListener(() => {
  LogLevel.levels.forEach(addLevelMethods);
});

export default Logger;
