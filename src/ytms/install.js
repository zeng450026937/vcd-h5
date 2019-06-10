import { ipcMain } from 'electron';
import { YTMSService } from './ytms-service';

const ytms = new YTMSService();

// get the very first client info and update to ytms server if needed
ytms.getClientInfo()
  .then(() => {
    if (ytms.isReady) {
      ytms.updateInfo();
    }
  });

ipcMain.on('push-update', (event, args) => {
  const { url } = args;
  const fullUrl = url.startsWith('http://') ? url : `http://${url}`;

  YTMSService.VUE_APP_YPUSH_URL = fullUrl;

  if (url && ytms.push) {
    ytms.push.baseURL = fullUrl;
    console.warn(`New URL: ${fullUrl}`);
  }
});

global.ytms = ytms;
