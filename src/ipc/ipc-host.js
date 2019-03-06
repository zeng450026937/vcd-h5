import { EventEmitter } from 'events';
import { getClientId, getClientInfo, clientInfo } from '../ytms/client-info';
import { getLogDirectoryPath, getNetLogDirectoryPath } from '../logger/get-log-path';

const signal = new EventEmitter();

// IPCHost will be proxyed by electron remote module.
export const ipcHost = {
  clientInfo,

  // renderern -> main
  emit(event) {
    signal.emit(event);
  },

  on(event, fn) {
    signal.on(event, fn);
  },

  once(event, fn) {
    signal.once(event, fn);
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
    const service = await ytms.enterprise.connect(url);

    // update client info
    ytms.clientInfo.enterprise = service.enterpriseInfo.enterprise;
    
    // update enterprise info to yealink
    ytms.yealink.updateInfo(ytms.clientInfo);

    // replace default service to yealink provider
    autoUpdater.provider.service = ytms.enterprise;
  },
};
