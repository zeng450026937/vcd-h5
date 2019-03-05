import { YTMSService } from './ytms-service';
import { getClientId, getClientInfo, clientInfo } from './client-info';

const ytms = {
  yealink    : new YTMSService(),
  enterprise : new YTMSService(),
  getClientId,
  getClientInfo,
  clientInfo,
};

ytms.getClientInfo();

global.ytms = ytms;
