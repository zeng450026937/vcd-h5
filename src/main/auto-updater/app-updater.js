import { EventEmitter } from 'events';
import { app } from 'electron';
import semver from 'semver';
// import { Provider } from './provider';
import { YealinkProvider } from './yealink-provider';

export class AppUpdater extends EventEmitter {
  constructor() {
    super();

    this.provider = this.genProvider();

    this.autoDownload = true;
    this.autoInstallOnAppQuit = true;
    this.allowDowngrade = false;

    this.appName = app.getName() || 'VCD-H5';
    this.appVersion = app.getVersion() || '1.0.0';
    this.appType = 'software';

    this.installing = false;
    this.installError = null;

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
    const info = await this.provider.getLatestVersion();

    if (!info) return;

    // TODO: compare version

    this.emit('update-avariable', info);

    if (this.autoDownload) {
      await this.downloadUpdate();
      // TODO: cache file
    }

    return info;
  }

  async downloadUpdate() {
    const path = await this.provider.download();

    return path;
  }

  quitAndInstall(silent = false, runAfter = false) {
    if (this.installing) return;

    this.installing = true;
    // TODO: finde file from cache
    let path;

    try {
      this.install({
        installer     : path,
        silent,
        runAfter,
        adminRequired : false,
      });
    }
    catch (error) {
      this.installError = error;
      // TODO: log some error
    }

    this.installing = false;

    if (this.installError) return;

    setImmediate(() => {
      app.quit();
    });
  }

  // private
  genProvider() {
    // return new Provider(this);
    return new YealinkProvider(this);
  }

  async install() {
    return null;
  }

  handlerQuit(exitCode) {
    if (!this.autoInstallOnAppQuit) return;
    if (exitCode !== 0) return;

    this.install();
  }
}
