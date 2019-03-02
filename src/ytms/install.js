import { app, ipcMain } from 'electron';
import { YTMSService } from './ytms-service';

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
      const service = await g_ytms_service.connect(url).catch(() => {});
      const ret = !!service;

      event.sender.send('start-ytms-service-reply', ret, service && service.client.clientId);

      // TODO: update enterprise info to yealink
    });
  });
}
