import { ipcRenderer } from 'electron';
import { enterprise } from '../../service';
import { PushService } from '../../../push-service';
import { getSystemInfo, sendNotification } from '../../proxy/main-process-proxy';
import { get } from 'lodash';


export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    const [ { data:{ data:enterpriseInfo } }, sysInfo ] = await Promise.all([
      enterprise.getEnterpriseInfo(),
      getSystemInfo(),
    ]).catch(() => Promise.reject());

    ipcRenderer.send('after-login', ctx.payload);

    const pushUrl = get(enterpriseInfo, 'pushService.url');
    const tenantId = get(enterpriseInfo, 'pushService.tenantId');

    if (!pushUrl || !tenantId) return;

    const pushService = new PushService(sysInfo.clientId);

    pushService.baseURL = pushUrl;
    pushService.tatentId = tenantId;
    pushService.poll();

    pushService.on('PUT_UPDATE', (msg) => { sendNotification(msg); });
    pushService.on('PUT_CONFIG', (msg) => { sendNotification(msg); });
    pushService.on('PUT_MESSAGE', (msg) => { sendNotification(msg); });
    pushService.on('GET_LOG', (msg) => { sendNotification(msg); });
    pushService.on('GET_CONFIG', (msg) => { sendNotification(msg); });
    pushService.on('GET_NETSTAT', (msg) => { sendNotification(msg); });
  }
});
