import { ipcRenderer } from 'electron';
import { enterprise } from '../../service';
import { PushService } from '../../../push-service';
import { getSystemInfo } from '../../proxy/main-process-proxy';


export default async(ctx, next) => next().then(async() => {
  if (ctx.ns === 'login' && ctx.method === 'doLogin') {
    const [ { data:{ data:enterpriseInfo } }, sysInfo ] = await Promise.all([
      enterprise.getEnterpriseInfo(),
      getSystemInfo(),
    ]).catch(() => Promise.reject());

    ipcRenderer.send('after-login', ctx.payload);

    if (!enterpriseInfo || !enterpriseInfo.ypushClientEndPoint || !enterpriseInfo.ypushTenantId) return;

    const pushService = new PushService(sysInfo.clientId);

    pushService.baseURL = `http://${enterpriseInfo.ypushClientEndPoint}`;
    pushService.tatentId = enterpriseInfo.ypushTenantId;
    pushService.poll();

    pushService.on('PUT_UPDATE', (msg) => { console.log(msg); });
    pushService.on('PUT_CONFIG', (msg) => { console.log(msg); });
    pushService.on('PUT_MESSAGE', (msg) => { console.log(msg); });
    pushService.on('GET_LOG', (msg) => { console.log(msg); });
    pushService.on('GET_CONFIG', (msg) => { console.log(msg); });
    pushService.on('GET_NETSTAT', (msg) => { console.log(msg); });
  }
});
