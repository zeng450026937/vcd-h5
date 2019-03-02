import { app, ipcMain } from 'electron';
import { getClientId } from './client-info';
import { YTMSService } from './ytms-service';

const g_ytms_service = new YTMSService();
const yealink_ytms = process.env.VUE_APP_YTMS_URL;

g_ytms_service.connect(yealink_ytms);

if (process.type === 'browser') {
  app.on('ready', () => {
    ipcMain.on('start-ytms-service', async(event, url) => {
      const service = await g_ytms_service.connect(url);

      event.sender.send('start-ytms-service-reply', service.client.clientId);
    });

    ipcMain.on('get-clientid', async(event) => {
      const id = await getClientId();
      
      event.sender.send('get-clientid-reply', id);
    });
  });
}
