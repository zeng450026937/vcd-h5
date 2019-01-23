/* eslint-disable import/no-extraneous-dependencies */
import { not, anObject, throwExceptionIf } from './utils';

const debug = require('debug')('log4electron:configure');

const listeners = [];

const addListener = (fn) => {
  listeners.push(fn);
  debug(`Added listener, listeners now ${listeners.length}`);
};

const configure = (candidate) => {
  debug('New configuration to be validated: ', candidate);
  throwExceptionIf(candidate, not(anObject(candidate)), 'must be an object.');
  debug(`Calling configuration listeners (${listeners.length})`);

  listeners.forEach((listener) => listener(candidate));
  debug('Configuration finished.');
};

export default {
  configure,
  addListener,
};
