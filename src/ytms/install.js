import { YTMSService } from './ytms-service';
import { getClientId, getClientInfo, clientInfo } from './client-info';

const ytms = {
  yealink    : new YTMSService(),
  enterprise : new YTMSService(),
  getClientId,
  getClientInfo,
  clientInfo,
};

// get the very first client info and update to ytms server if needed
getClientInfo()
  .then(() => {
    if (ytms.yealink.isReady) {
      ytms.yealink.updateInfo(clientInfo);
    }
    if (ytms.enterprise.isReady) {
      ytms.yealink.updateInfo(clientInfo);
    }
  });

global.ytms = ytms;
