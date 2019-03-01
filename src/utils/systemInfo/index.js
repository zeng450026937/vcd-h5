const sys = require('systeminformation/lib/system');
const cpu = require('systeminformation/lib/cpu');
const network = require('systeminformation/lib/network');
const memory = require('systeminformation/lib/memory');
const os = require('systeminformation/lib/osinfo');

let systemInfo;

export function getSystemInfo() {
  return new Promise(async(resolve, reject) => {
    if (systemInfo) return resolve(systemInfo);

    try {
      const [ sysInfo, cpuInfo, networkInfo, memoryInfo, osInfo ] = await Promise.all([
        sys.system(),
        cpu.cpu(),
        network.networkInterfaces(),
        memory.mem(),
        os.osInfo(),
      ]);
      // console.log({ sysInfo, cpuInfo, networkInfo, memoryInfo, osInfo });

      resolve(systemInfo = {
        clientId       : sysInfo.uuid.replace(/-/g, '').toLowerCase(),
        clientName     : osInfo.hostname,
        clientModel    : 'VCD-H5',
        clientType     : 'software',
        clientVersion  : process.env.VUE_APP_VERSION,
        clientArch     : osInfo.arch,
        clientPlatform : osInfo.platform,
        device         : {
          ip       : networkInfo[0].ip4,
          mac      : networkInfo[0].mac,
          hostname : osInfo.hostname,
          cpu      : cpuInfo.brand,
          memory   : memoryInfo.total,
          os       : osInfo.distro,
        },
      });

      // console.log(systemInfo);
    }
    catch (e) {
      reject(e);
    }
  });
}


export default {
  getSystemInfo,
};
