import { EventEmitter } from 'events';
import { getClientId, getClientInfo, clientInfo } from '../ytms/client-info';
import { getLogDirectoryPath, getNetLogDirectoryPath } from '../logger/get-log-path';

const signal = new EventEmitter();

// IPCHost will be proxyed by electron remote module.
export const ipcHost = {
  clientInfo,

  // renderer -> main
  emit(event) {
    signal.emit(event);
  },

  on(event, fn) {
    signal.on(event, fn);
  },

  once(event, fn) {
    signal.once(event, fn);
  },

  boomdown() {
    setImmediate(() => {
      throw new Error('Boomtown!');
    });
  },

  getClientId() {
    return getClientId();
  },

  getClientInfo() {
    return getClientInfo();
  },

  getLogDirectoryPath() {
    return getLogDirectoryPath();
  },

  getNetLogDirectoryPath() {
    return getNetLogDirectoryPath();
  },

  async startYTMSService(url) {
    const service = await ytms.connect(url);

    logger.info(`ytms connected, url: ${service.url} push-service: ${service.baseURL} ${service.tenantId}`);

    // update client info
    ytms.clientInfo.enterprise = service.enterpriseInfo.enterprise;
    
    // update enterprise info to server
    ytms.updateInfo();

    return ytms.clientId;
  },
};
