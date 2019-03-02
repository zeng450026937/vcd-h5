import {
  getSystemId,
  getCpuInfo,
  getNetInfo,
  getMemInfo,
  getOsInfo,
} from './system-info';

const clientInfo = {
  clientId       : '',
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

export async function getClientId() {
  return getSystemId();
}

export async function getClientInfo() {
  // getSystemId will not be failed
  const sysId = await getSystemId();

  clientInfo.clientId = sysId;

  const [ 
    cpuInfo,
    netInfo, 
    memInfo, 
    osInfo, 
  ] = await Promise.all([
    getCpuInfo().catch(() => ({})),
    getNetInfo().catch(() => ({})),
    getMemInfo().catch(() => ({})),
    getOsInfo().catch(() => ({})),
  ]);

  clientInfo.clientName = osInfo.hostname;
  clientInfo.device.ip = netInfo[0] && netInfo[0].ip4;
  clientInfo.device.mac = netInfo[0] && netInfo[0].mac;
  clientInfo.device.hostname = osInfo.hostname;
  clientInfo.device.cpu = cpuInfo.brand;
  clientInfo.device.memory = memInfo.total;
  clientInfo.device.os = osInfo.platform;

  return clientInfo;
}
