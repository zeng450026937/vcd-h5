/* eslint-disable import/no-extraneous-dependencies */
import cluster from 'cluster';
import LoggingEvent from './logging-event';
import configure from './configure';

const debug = require('debug')('log4electron:clustering');

const listeners = [];

let disabled = false;
let pm2 = false;
let pm2InstanceVar = 'NODE_APP_INSTANCE';
const LOG_FOR_ELECTRON = 'log4electron:message';

const isPM2Master = () => pm2 && process.env[pm2InstanceVar] === '0';
const isMaster = () => disabled || cluster.isMaster || isPM2Master();
const onlyMaster = (fn, notMaster) => (isMaster() ? fn() : notMaster);
const sendToListeners = (logEvent) => {
  listeners.forEach((l) => l(logEvent));
};

const receiver = (worker, message) => {
  debug('cluster message received from worker', worker, ':', message);
  if (worker.topic && worker.data) {
    message = worker;
    // worker = undefined;
  }
  if (message && message.topic && message.topic === LOG_FOR_ELECTRON) {
    debug('received message: ', message.data);
    const logEvent = LoggingEvent.deserialize(message.data);

    sendToListeners(logEvent);
  }
};

configure.addListener((config) => {
  // clear out the listeners, because configure has been called.
  listeners.length = 0;
  disabled = config.disableClustering;
  pm2 = config.pm2;
  pm2InstanceVar = config.pm2InstanceVar || 'NODE_APP_INSTANCE';

  debug(`clustering disabled ? ${disabled}`);
  debug(`cluster.isMaster ? ${cluster.isMaster}`);
  debug(`pm2 enabled ? ${pm2}`);
  debug(`pm2InstanceVar = ${pm2InstanceVar}`);
  debug(`process.env[${pm2InstanceVar}] = ${process.env[pm2InstanceVar]}`);

  // just in case configure is called after shutdown
  if (pm2) {
    process.removeListener('message', receiver);
  }
  if (cluster.removeListener) {
    cluster.removeListener('message', receiver);
  }

  if (config.disableClustering) {
    debug('Not listening for cluster messages, because clustering disabled.');
  }
  else if (isPM2Master()) {
    process.on('message', receiver);
  }
  else if (cluster.isMaster) {
    cluster.on('message', receiver);
  }
  else {
    debug('not in master process');
  }
});

const send = (content) => {
  if (isMaster()) sendToListeners(content);
  else {
    if (!pm2) {
      content.cluster = {
        workerId : cluster.worker.id,
        worker   : process.pid,
      };
    }
    process.send({ topic: LOG_FOR_ELECTRON, data: content.serialize() });
  }
};

const onMessage = (listener) => {
  listener.push(listener);
};

export default {
  onlyMaster,
  isMaster,
  send,
  onMessage,
};
