import { EventEmitter } from 'events';
import { app } from 'electron';
import { Provider } from './provider';

export class AppUpdater extends EventEmitter {
  constructor() {
    super();

    this.provider = this.genProvider();

    this.autoDownload = true;
    this.autoInstallOnAppQuit = true;
    this.allowDowngrade = false;

    this.appName = app.getName() || 'VCD-H5';
    this.appVersion = app.getVersion() || '1.0.0';

    this.installing = false;
    this.installError = null;

    this.isAutoInstall = true;

    // AppUpdater is designed to be only one instance.
    app.once('quit', this.handlerQuit.bind(this));
  }

  get appSuffix() {
    return '';
  }

  get isAvariable() {
    return app.isPackaged;
  }

  get isDownloading() {
    return this.provider && this.provider.isDownloading;
  }

  get channel() {
    return this.provider.channel;
  }

  set channel(channel) {
    this.provider.channel = channel;
  }

  setFeedURL(url) {
    this.provider.feedURL = url;
  }

  getFeedURL() {
    return this.provider.feedURL;
  }

  async checkForUpdates() {
    const info = await this.provider.getLatestVersion().catch((e) => {
      logger.error(e);
      this.emit('error', e);
    });

    if (!info) {
      this.emit('error', new Error('Recevied empty info'));

      return;
    }

    const avariable = this.provider.isVersionAvariable(info);

    logger.info(`update-available: ${avariable}, info: %o`, info);

    if (!avariable) return this.emit('update-not-available', info);

    this.emit('update-available', info);

    if (this.autoDownload) {
      // async download
      this.provider.download(info).catch((e) => logger.error('download update failed, error: %s', e));
    }

    return info;
  }

  async downloadUpdates() {
    if (!this.provider.latestVersion) throw new Error('Check update first');

    return this.provider.download();
  }

  quitAndInstall(silent = false, runAfter = false) {
    if (this.installing) return;
    if (!this.provider.latestVersionDownloaded) return;

    const { latestFile } = this.provider;

    this.installing = true;

    try {
      this.install({
        installer     : latestFile.path,
        silent,
        runAfter,
        adminRequired : !!latestFile.adminRequired,
      });
    }
    catch (error) {
      this.installError = error;
      logger.error('Install app error', error);
    }

    this.installing = false;

    if (this.installError) return;

    this.isAutoInstall = false;

    setImmediate(() => {
      app.quit();
    });
  }

  setProvider(provider) {
    if (this.provider.isDownloading) {
      this.provider.appUpdater = null;
      this.provider.cancel();
    }

    provider.appUpdater = this;

    this.provider = provider;
  }

  // private
  genProvider() {
    return new Provider(this);
  }

  async install() {
    return null;
  }

  handlerQuit(event, exitCode) {
    if (exitCode !== 0) return;
    if (!this.autoInstallOnAppQuit) return;
    if (!this.provider.latestVersionDownloaded) return;
    if (!this.isAutoInstall) return;

    const { latestFile } = this.provider;

    this.install({
      installer     : latestFile.path,
      silent        : true,
      runAfter      : false,
      adminRequired : !!latestFile.adminRequired,
    }).catch(() => {}); // ignore anyway
  }
}
