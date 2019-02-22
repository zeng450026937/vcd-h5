const sys = require('systeminformation/lib/system');
const cpu = require('systeminformation/lib/cpu');
const network = require('systeminformation/lib/network');
const memory = require('systeminformation/lib/memory');
const os = require('systeminformation/lib/osinfo');

export function getSystemInfo() {
  return new Promise(async(resolve, reject) => {
    try {
      const [ sysInfo, cpuInfo, networkInfo, memoryInfo, osInfo ] = await Promise.all([
        sys.system(),
        cpu.cpu(),
        network.networkInterfaces(),
        memory.mem(),
        os.osInfo(),
      ]);

      resolve({
        clientId       : sysInfo.uuid.replace(/-/g, '').toLowerCase(),
        clientModel    : osInfo.distro,
        clientName     : osInfo.hostname,
        clientOs       : osInfo.platform,
        clientType     : 0,
        cpuCore        : cpuInfo.cores,
        cpuModel       : cpuInfo.brand,
        ip             : networkInfo[0].ip4,
        mac            : networkInfo[0].mac,
        memory         : memoryInfo.total,
        packageVersion : process.env.VUE_APP_VERSION,
      });
    }
    catch (e) {
      reject(e);
    }
  });
}

export default {
  getSystemInfo,
};
