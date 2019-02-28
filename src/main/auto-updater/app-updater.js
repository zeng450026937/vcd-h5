import { EventEmitter } from 'events';
import { app } from 'electron';
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
      await this.provider.download(info);
    }

    return info;
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
    if (exitCode !== 0) return;
    if (!this.autoInstallOnAppQuit) return;
    if (!this.provider.latestVersionDownloaded) return;

    const { latestFile } = this.provider;

    this.install({
      installer     : latestFile.path,
      silent        : true,
      runAfter      : false,
      adminRequired : !!latestFile.adminRequired,
    }).catch(() => {}); // ignore anyway
  }
}
