import {Emitter, Disposable} from 'event-kit';
import {remote} from 'electron'
import {sendWillQuitSync} from '../mainProcessProxy'

const autoUpdater = remote.autoUpdater;

const UpdateStatus = {
  CheckingForUpdates: 0,     // 开始检查更新
  UpdateAvailable: 1,     // 发现一个可用更新
  UpdateNotAvailable: 2,     // 没有可用更新
  UpdateReady: 3,     // 更新下载完成
};

class Updater {
  
  constructor() {
    this.status = UpdateStatus.UpdateNotAvailable;
    this.lastSuccessfulCheck = null;
    this.emitter = new Emitter();
    
    const autoUpdaterError = this.onAutoUpdaterError.bind(this);
    const checkingForUpdate = this.onCheckingForUpdate.bind(this);
    const updateAvailable = this.onUpdateAvailable.bind(this);
    const updateNotAvailable = this.onUpdateNotAvailable.bind(this);
    const updateDownloaded = this.onUpdateDownloaded.bind(this);
    
    autoUpdater.on('error', autoUpdaterError);
    autoUpdater.on('checking-for-update', checkingForUpdate);
    autoUpdater.on('update-available', updateAvailable);
    autoUpdater.on('update-not-available', updateNotAvailable);
    autoUpdater.on('update-downloaded', updateDownloaded);
    
    window.addEventListener('beforeunload', function () {
      autoUpdater.removeListener('error', autoUpdaterError);
      autoUpdater.removeListener('checking-for-update', checkingForUpdate);
      autoUpdater.removeListener('update-available', updateAvailable);
      autoUpdater.removeListener('update-not-available', updateNotAvailable);
      autoUpdater.removeListener('update-downloaded', updateDownloaded);
      
    });
    
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
    console.log('download completed!');
    this.emitDidChange();
  }
  
  checkForUpdates() {
    if (this.status === UpdateStatus.UpdateReady) return;
    try {
      const url = `http://10.200.112.103:5014/update/win32/1.0.0`;
      autoUpdater.setFeedURL({url});
      autoUpdater.checkForUpdates();
    } catch (e) {
      this.emitError(e);
    }
  }
  
  quitAndInstallUpdate() {
    autoUpdater.quitAndInstall();
    sendWillQuitSync();
  }
  
  touchLastChecked() {
    this.lastSuccessfulCheck = new Date().valueOf();
  }
  
  emitError(error) {
    console.log(error);
    this.emitter.emit('error', error);
  }
  
  emitDidChange() {
    console.log(this.state);
    this.emitter.emit('did-change', this.state);
  }
  
  onDidChange(callback) {
    this.emitter.on('did-change', callback)
  }
  
  get state() {
    return {
      status: this.status,
      lastSuccessfulCheck: this.lastSuccessfulCheck,
    };
  }
  
  destroy() {
  
  }
}


export default new Updater();
