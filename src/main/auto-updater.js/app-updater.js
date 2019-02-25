import { EventEmitter } from 'events';
import { app } from 'electron';

export class AppUpdater extends EventEmitter {
  constructor() {
    super();

    this.brand = 'yealink';
    this.channel = 'stable'; // insiders, fast, stable

    this.autoDownload = true;
    this.autoInstallOnAppQuit = true;
    this.allowDowngrade = false;
  }

  get isAvariable() {
    return app.isPackaged;
  }

  setFeedURL() {}

  getFeedURL() {}

  checkForUpdates() {}

  quitAndInstall() {}
}
