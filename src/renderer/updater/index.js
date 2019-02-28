import { EventEmitter } from 'events';
import { remote } from 'electron';
import delegate from 'delegates';
import { sendWillQuitSync } from '../proxy/main-process-proxy';

const USE_SQUIRREL = process.env.VUE_APP_USE_SQUIRREL && process.env.VUE_APP_USE_SQUIRREL === 'true';
const autoUpdater = remote.getGlobal('autoUpdater');

window.autoUpdater = autoUpdater;

export const UpdateStatus = {
  CheckingForUpdates : 0, // 开始检查更新
  UpdateAvailable    : 1, // 发现一个可用更新
  UpdateNotAvailable : 2, // 没有可用更新
  UpdateReady        : 3, // 更新下载完成
  UpdateDownloading  : 4, // 更新下载中
};

export class Updater extends EventEmitter {
  constructor() {
    super();

    this.autoUpdater = autoUpdater;
    this.status = UpdateStatus.UpdateNotAvailable;
    this.progress = null;
    this.lastSuccessfulCheck = null;
    
    const autoUpdaterError = this.onAutoUpdaterError.bind(this);
    const checkingForUpdate = this.onCheckingForUpdate.bind(this);
    const updateAvailable = this.onUpdateAvailable.bind(this);
    const updateNotAvailable = this.onUpdateNotAvailable.bind(this);
    const updateDownloaded = this.onUpdateDownloaded.bind(this);
    const updateDownloading = this.onUpdateDownloading.bind(this);
    
    autoUpdater.on('error', autoUpdaterError);
    autoUpdater.on('checking-for-update', checkingForUpdate);
    autoUpdater.on('update-available', updateAvailable);
    autoUpdater.on('update-not-available', updateNotAvailable);
    autoUpdater.on('update-downloaded', updateDownloaded);
    autoUpdater.on('download-progress', updateDownloading);
    
    window.addEventListener('beforeunload', () => {
      autoUpdater.removeListener('error', autoUpdaterError);
      autoUpdater.removeListener('checking-for-update', checkingForUpdate);
      autoUpdater.removeListener('update-available', updateAvailable);
      autoUpdater.removeListener('update-not-available', updateNotAvailable);
      autoUpdater.removeListener('update-downloaded', updateDownloaded);
      autoUpdater.removeListener('download-progress', updateDownloading);
    });

    delegate(this, 'autoUpdater')
      .access('channel')
      .access('autoDownload')
      .access('autoInstallOnAppQuit')
      .access('allowDowngrade')
      .method('downloadUpdate');
  }
  
  onAutoUpdaterError(error) {
    this.status = UpdateStatus.UpdateNotAvailable;
    this.emitError(error);
  }
  
  onCheckingForUpdate() {
    this.status = UpdateStatus.CheckingForUpdates;
    this.emitDidChange();
  }
  
  onUpdateAvailable() {
    this.touchLastChecked();
    this.status = UpdateStatus.UpdateAvailable;
    this.emitDidChange();
  }
  
  onUpdateNotAvailable() {
    this.touchLastChecked();
    this.status = UpdateStatus.UpdateNotAvailable;
    this.emitDidChange();
  }
  
  onUpdateDownloaded() {
    this.status = UpdateStatus.UpdateReady;
    this.emitDidChange();
  }

  onUpdateDownloading(progress) {
    if (this.status !== UpdateStatus.UpdateDownloading) {
      this.status = UpdateStatus.UpdateDownloading;
      this.emitDidChange();
    }
    this.progress = progress;
    this.emitProgress();
  }

  setFeedURL(url) {
    try {
      url = url || `${process.env.VUE_APP_UPDATE_URL}`;
      const provider = 'generic';

      autoUpdater.setFeedURL({ url, provider });
    }
    catch (e) {
      this.emitError(e); 
    }
  }
  
  checkForUpdates() {
    if (this.status === UpdateStatus.UpdateReady) return;

    try {      
      if (USE_SQUIRREL) {
        autoUpdater.checkForUpdates();
      }
      else {
        autoUpdater.checkForUpdates().catch(() => {});
      }
    }
    catch (e) {
      this.emitError(e);
    }
  }
  
  quitAndInstallUpdate() {
    sendWillQuitSync();
    autoUpdater.quitAndInstall();
  }
  
  touchLastChecked() {
    this.lastSuccessfulCheck = new Date().valueOf();
  }
  
  emitError(error) {
    this.emit('error', error);
  }
  
  emitDidChange() {
    this.emit('did-change', this.state);
  }

  emitProgress() {
    this.emit('progress', this.progress);
  }
  
  onDidChange(callback) {
    this.on('did-change', callback);
  }
  
  get state() {
    return {
      status              : this.status,
      lastSuccessfulCheck : this.lastSuccessfulCheck,
    };
  }
  
  destroy() {
  
  }
}

export default new Updater();
