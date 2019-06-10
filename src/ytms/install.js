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

  if (url && ytms.push) {
    ytms.push.baseURL = url.startsWith('http://') ? url : `http://${url}`;
    console.warn(`New URL: ${ytms.push.baseURL}`);
  }
});

global.ytms = ytms;
