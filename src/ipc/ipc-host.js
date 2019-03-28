import { getClientId, getClientInfo, clientInfo } from '../ytms/client-info';
import { getLogDirectoryPath, getNetLogDirectoryPath } from '../logger/get-log-path';

// IPCHost will be proxyed by electron remote module.
export const ipcHost = {
  clientInfo,

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
    if (ytms.url === url && ytms.isReady) {
      return ytms.clientId;
    }

    const service = await ytms.connect(url);

    logger.info(`ytms connected, url: ${service.url} push-service: ${service.baseURL} ${service.tenantId}`);

    // update client info
    ytms.clientInfo.enterprise = service.enterpriseInfo.enterprise;
    
    // update enterprise info to server
    ytms.updateInfo();

    return ytms.clientId;
  },

  updateClientInfo() {
    ytms.updateInfo();
  },
};
