import { YTMSService } from './ytms-service';

const ytms = new YTMSService();

// get the very first client info and update to ytms server if needed
ytms.getClientInfo()
  .then(() => {
    if (ytms.isReady) {
      ytms.updateInfo();
    }
  });

global.ytms = ytms;
