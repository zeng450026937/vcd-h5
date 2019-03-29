import { remote } from 'electron';
import Vuem from './vuem';
import { sendWillQuitSync } from '../proxy/main-process-proxy';

const USE_SQUIRREL = process.env.VUE_APP_USE_SQUIRREL && process.env.VUE_APP_USE_SQUIRREL === 'true';
const autoUpdater = window.autoUpdater = remote.getGlobal('autoUpdater');

const UPDATE_STATE = {};

UPDATE_STATE[UPDATE_STATE.CHECKING = 0] = 'checking';
UPDATE_STATE[UPDATE_STATE.AVAILABLE = 1] = 'available';
UPDATE_STATE[UPDATE_STATE.INVALID = 2] = 'invalid';
UPDATE_STATE[UPDATE_STATE.READY = 3] = 'ready';
UPDATE_STATE[UPDATE_STATE.DOWNLOADING = 4] = 'downloading';

export { UPDATE_STATE };

const model = new Vuem();

model.provide({
  data() {
    return {
      channel              : autoUpdater.channel,
      autoDownload         : autoUpdater.autoDownload,
      autoInstallOnAppQuit : autoUpdater.autoInstallOnAppQuit,
      allowDowngrade       : autoUpdater.allowDowngrade,
      status               : UPDATE_STATE.INVALID,
      progress             : null,
      lastSuccessfulCheck  : null,
      error                : null,
    };
  },

  computed : {
    appName() {
      return autoUpdater.appName;
    },

    appVersion() {
      return autoUpdater.appVersion;
    },
  },

  watch : {
    channel(val) {
      autoUpdater.channel = val;
    },

    autoDownload(val) {
      autoUpdater.autoDownload = val;
    },

    autoInstallOnAppQuit(val) {
      autoUpdater.autoInstallOnAppQuit = val;
    },

    allowDowngrade(val) {
      autoUpdater.allowDowngrade = val;
    },
  },

  middleware : {
    async checkForUpdates(ctx, next) {
      await next();

      this.checkForUpdates();
    },

    async downloadUpdate(ctx, next) {
      await next();

      this.downloadUpdate();
    },

    async quitAndInstallUpdate(ctx, next) {
      await next();

      this.quitAndInstallUpdate();
    },
  },
  
  methods : {
    setFeedURL(url) {
      try {  
        autoUpdater.setFeedURL(url);
      }
      catch (e) {
        this.error = e;
      }
    },

    checkForUpdates() {
      if (
        this.status === UPDATE_STATE.READY
        || this.status === UPDATE_STATE.DOWNLOADING
      ) return;

      try {      
        if (USE_SQUIRREL) {
          autoUpdater.checkForUpdates();
        }
        else {
          autoUpdater.checkForUpdates().catch(() => {});
        }
      }
      catch (e) {
        this.error = e;
      }
    },

    downloadUpdate() {
      if (USE_SQUIRREL) return;

      autoUpdater.downloadUpdate();
    },

    quitAndInstallUpdate() {
      if (this.status !== UPDATE_STATE.READY) return;
      
      sendWillQuitSync();
      autoUpdater.quitAndInstall();
    },

    updateError(e) {
      this.error = e;
      this.status = UPDATE_STATE.INVALID;
    },

    updateChecking() {
      this.status = UPDATE_STATE.CHECKING;
    },

    updateAvailable() {
      this.status = UPDATE_STATE.AVAILABLE;
      this.lastSuccessfulCheck = Date.now();
    },

    updateNotAvailable() {
      this.status = UPDATE_STATE.INVALID;
    },

    updateDownloaded() {
      this.status = UPDATE_STATE.READY;
    },

    updateDownloading(progress) {
      this.status = UPDATE_STATE.DOWNLOADING;
      this.progress = progress;
    },
  },

  async created() {
    autoUpdater.on('error', this.updateError);
    autoUpdater.on('checking-for-update', this.updateChecking);
    autoUpdater.on('update-available', this.updateAvailable);
    autoUpdater.on('update-not-available', this.updateNotAvailable);
    autoUpdater.on('downloaded', this.updateDownloaded);
    autoUpdater.on('download-progress', this.updateDownloading);

    this.checkInterval = 3600 * 1000; // one hour
    this.checkTimer = null;

    // model hasn't be fully initilized when created() invoked
    await this.$nextTick();
    // model fully initilized

    const setting = this.$getVM('setting');

    setting.$watch(
      'updateChannel',
      (val) => {
        this.channel = val;
      },
      { immediate: true }
    );
    setting.$watch(
      'autoUpdate',
      (val) => {
        this.autoInstallOnAppQuit = val;
      },
      { immediate: true }
    );

    this.checkTimer = setInterval(this.checkForUpdates, this.checkInterval);
  },

  beforeDestroy() {
    autoUpdater.removeListener('error', this.updateError);
    autoUpdater.removeListener('checking-for-update', this.updateChecking);
    autoUpdater.removeListener('update-available', this.updateAvailable);
    autoUpdater.removeListener('update-not-available', this.updateNotAvailable);
    autoUpdater.removeListener('update-downloaded', this.updateDownloaded);
    autoUpdater.removeListener('download-progress', this.updateDownloading);

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  },
});

export default model;
