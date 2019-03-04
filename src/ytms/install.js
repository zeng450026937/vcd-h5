import { YTMSService } from './ytms-service';

const ytms = new YTMSService();

// fetch client info
ytms.getClientInfo();

global.ytms = ytms;
