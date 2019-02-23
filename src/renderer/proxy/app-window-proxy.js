import { ipcRenderer } from 'electron';
import { getSystemInfo } from './main-process-proxy';
import { deviceManagement, ylDeviceManagement } from '../service';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  async mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);

    let systemInfo = this.$storage.query('SYSTEM_INFO');

    if (!systemInfo) {
      systemInfo = await getSystemInfo();
      this.$storage.insertOrUpdate('SYSTEM_INFO', systemInfo, 'clientId');
    }

    deviceManagement.clientUpdate(systemInfo.clientId, systemInfo);
    ylDeviceManagement.clientUpdate(systemInfo.clientId, systemInfo);
  },
};
