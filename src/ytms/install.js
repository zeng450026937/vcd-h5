import {
  app,
  ipcMain,
} from 'electron';
import {
  getSystemInfo,
  getCpuInfo,
  getNetInfo,
  getMemInfo,
  getOsInfo,
} from './system-info';
import {
  YTMSClient,
} from './ytms-client';
import {
  PushService,
} from './push-service';

let yealinkClient = null;
let yealinkPush = null;
let enterpriseClient = null;
let enterprisePush = null;
let clientId = 'fallback clientId';
const clientInfo = {
  clientName     : '',
  clientModel    : process.env.VUE_APP_MODEL,
  clientType     : process.env.VUE_APP_TYPE,
  clientVersion  : process.env.VUE_APP_VERSION,
  clientArch     : process.arch,
  clientPlatform : process.platform,
  device         : {
    ip       : '',
    mac      : '',
    hostname : '',
    cpu      : '',
    memory   : '',
    os       : '',
  },
  enterprise : {
    id     : '',
    name   : '',
    domain : '',
  },
  user : {
    account  : '',
    domain   : '',
    outbound : '',
    status   : '',
  },
};

process.on('uncaughtException', (error) => {
  if (!yealinkClient || !yealinkClient.isReady) return;

  yealinkClient.api.doAlarm({});
});

let clientInfoPromise = Promise.resolve();

const systemInfoPromise = getSystemInfo()
  .catch(() => ({}))
  .then(() => {
    clientInfoPromise = Promise.all([
      getCpuInfo().catch(() => ({})),
      getNetInfo().catch(() => ({})),
      getMemInfo().catch(() => ({})),
      getOsInfo().catch(() => ({})),
    ])
      .then(async([ cpuInfo, netInfo, memInfo, osInfo ]) => {
        // update client info
        clientInfo.clientName = osInfo.hostname;
        clientInfo.device.ip = netInfo[0] && netInfo[0].ip4;
        clientInfo.device.mac = netInfo[0] && netInfo[0].mac;
        clientInfo.device.hostname = osInfo.hostname;
        clientInfo.device.cpu = cpuInfo.brand;
        clientInfo.device.memory = memInfo.total;
        clientInfo.device.os = osInfo.platform;
      });
  })
  .then((info) => {
    const { uuid } = info;

    if (uuid) {
      clientId = uuid.replace(/-/g, '').toLowerCase();
    }

    // start yealink client
    const url = process.env.VUE_APP_YTMS_URL;

    yealinkClient = new YTMSClient(url, clientId);
    yealinkClient.start();

    const tenantId = process.env.VUE_APP_YPUSH_TENANTID;

    yealinkPush = new PushService(url, clientId, Number.parseInt(tenantId, 10));
    yealinkPush.poll();

    clientInfoPromise
      .then(() => yealinkClient.whenReady())
      .then(() => yealinkClient.updateInfo(clientInfo));
  });

// 此部分代码只需在主进程运行
app.on('ready', () => {
  ipcMain.on('connect to enterprise ytms', async(event, url) => {
    if (!clientId) {
      await systemInfoPromise;
    }

    if (!enterpriseClient) {
      enterpriseClient.stop();
      enterpriseClient = null;
    }

    enterpriseClient = new YTMSClient(url, clientId);
    enterpriseClient.start();

    event.sender.send('hello clientId', clientId);

    await enterpriseClient.whenReady();

    /*
    const { enterprise, pushService } = enterpriseClient.enterpriseInfo;

    clientInfo.enterprise.id = enterprise.id;
    clientInfo.enterprise.name = enterprise.name;

    const { url: pushURL, tenantId } = pushService;
    */
    const tenantId = process.env.VUE_APP_YPUSH_TENANTID;

    enterprisePush = new PushService(url, clientId, Number.parseInt(tenantId, 10));
    enterprisePush.poll();

    await clientInfoPromise;
    enterpriseClient.updateInfo(clientInfo);

    // update enterprise info to yealink
    await yealinkClient.whenReady();
    yealinkClient.updateInfo(clientInfo);
  });

  ipcMain.on('get clientId', (event) => {
    event.sender.send('get clientId replay', clientId);
  });
});
