import {
  app,
} from 'electron';
import {
  getSystemId,
  getCpuInfo,
  getNetInfo,
  getMemInfo,
  getOsInfo,
} from './system-info';
import { newPlainUUID } from '../shared/uuid';

function normalizePlatform(platform) {
  return platform === 'win32' 
    ? 'windows' 
    : platform === 'darwin'
      ? 'mac' : platform;
}

export const clientInfo = {
  clientId       : newPlainUUID(),
  clientName     : app.getName(),
  clientCategory : process.env.VUE_APP_CATEGORY,
  clientModel    : process.env.VUE_APP_MODEL,
  clientType     : process.env.VUE_APP_TYPE,
  clientVersion  : app.getVersion(),
  clientArch     : process.arch,
  clientPlatform : normalizePlatform(process.platform),
  customId       : process.env.VUE_APP_CUSTOMID,
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
    getCpuInfo(),
    getNetInfo(),
    getMemInfo(),
    getOsInfo(),
  ]);

  clientInfo.clientName = osInfo.hostname;
  clientInfo.device.ip = netInfo[0] && netInfo[0].ip4;
  clientInfo.device.mac = netInfo[0] && netInfo[0].mac;
  clientInfo.device.hostname = osInfo.hostname;
  clientInfo.device.cpu = cpuInfo.brand;
  clientInfo.device.memory = memInfo.total;
  clientInfo.device.os = osInfo.distro;

  return clientInfo;
}
