import { app, ipcMain } from 'electron';
import { getClientId } from './client-info';
import { YTMSService } from './ytms-service';
import { Alarm } from './uploader';

const g_ytms_service = new YTMSService();

global.ytmsService = g_ytms_service;
// connect default
g_ytms_service.connect()
  .then(() => {
    // TODO: do something else. eg. log report
  });

if (process.type === 'browser') {
  app.on('ready', () => {
    ipcMain.on('start-ytms-service', async(event, url) => {
      // TODO: handle connect fail, send message to renderer process.
      const service = await g_ytms_service.connect(url);

      event.sender.send('start-ytms-service-reply', service.client.clientId);

      // TODO: update enterprise info to yealink
    });

    ipcMain.on('get-clientid', async(event) => {
      const id = await getClientId();
      
      event.sender.send('get-clientid-reply', id);
    });
  });
}
