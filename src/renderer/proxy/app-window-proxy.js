import { ipcRenderer } from 'electron';
import updater from '../updater';

const startTime = performance.now();

export const AppWindowProxy = {
  mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);
    // prepare updater
    updater.setFeedURL();
    updater.channel = 'alpha';
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;
    updater.allowDowngrade = true;
    // start the first check
    updater.checkForUpdates();
  },
};
