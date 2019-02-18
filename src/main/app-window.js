import { BrowserWindow, ipcMain, Menu, app, powerSaveBlocker } from 'electron';
import { BaseWindow } from './base-window';
import { MediaWindow } from './media-window';
import { AppTray } from './app-tray';
import { formatPathAsUrl } from './utils';

let windowStateKeeper = null;
const minWidth = 1120;
const minHeight = 630;

export class AppWindow extends BaseWindow {
  constructor() {
    if (!windowStateKeeper) {
      // `electron-window-state` requires Electron's `screen` module, which can
      // only be required after the app has emitted `ready`. So require it
      // lazily.
      /* eslint-disable global-require */
      windowStateKeeper = require('electron-window-state');
    }
    
    const savedWindowState = windowStateKeeper({
      defaultWidth  : minWidth,
      defaultHeight : minHeight,
    });

    const windowOptions = {
      x               : savedWindowState.x,
      y               : savedWindowState.y,
      width           : savedWindowState.width,
      height          : savedWindowState.height,
      minWidth,
      minHeight,
      show            : false,
      // This fixes subpixel aliasing on Windows
      // See https://github.com/atom/atom/commit/683bef5b9d133cb194b476938c77cc07fd05b972
      backgroundColor : '#fff',
      webPreferences  : {
        // Disable auxclick event
        // See https://developers.google.com/web/updates/2016/10/auxclick
        disableBlinkFeatures : 'Auxclick',
        // Enable, among other things, the ResizeObserver
        experimentalFeatures : true,
        nativeWindowOpen     : true,
        webSecurity          : false,
      },
      acceptFirstMouse : true,
    };

    super(windowOptions);

    savedWindowState.manage(this.window);

    this.blocker = null;
    this.tray = null;
    this.quitting = false;

    this.blocker = powerSaveBlocker.start('prevent-app-suspension');
    this.tray = new AppTray();

    this.tray.onClick(() => this.restoreWindow);

    app.on('before-quit', () => {
      this.quitting = true;
      if (this.blocker && powerSaveBlocker.isStarted(this.blocker)) {
        powerSaveBlocker.stop(this.blocker);
        this.blocker = null;
      }
      if (this.tray && !this.tray.isDestroyed()) {
        this.tray.destroy();
        this.tray = null;
      }
    });

    ipcMain.on('will-quit', (event) => {
      this.quitting = true;
      event.returnValue = true;
    });
    
    // on macOS, when the user closes the window we really just hide it. This
    // lets us activate quickly and keep all our interesting logic in the
    // renderer.
    if (__DARWIN__) {
      this.window.on('close', (e) => {
        if (!this.quitting) {
          e.preventDefault();
          Menu.sendActionToFirstResponder('hide:');
        }
      });
    }
  }

  load(url) {
    // TODO: This should be scoped by the window.
    ipcMain.once(
      'renderer-ready',
      (event, readyTime) => {
        this.rendererReadyTime = readyTime;
        this.hasFinishedRendering = true;

        this.maybeEmitDidLoad();
      }
    );

    /* eslint-disable no-shadow */
    // window.open('', 'media')
    this.window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === 'screen-share') {
        options.minWidth = 528;
        options.minHeight = 297;
      }
      else {
        options.minWidth = 0;
        options.minHeight = 0;
      }
      options.webPreferences.experimentalFeatures = false;
      options.webPreferences.nativeWindowOpen = false;
      options.webPreferences.nodeintegration = false;
      options.webPreferences.nodeIntegrationInWorker = false;
    });
    /* eslint-enable no-shadow */

    if (process.env.NODE_ENV === 'development') {
      url = process.env.WEBPACK_DEV_SERVER_URL;
    }
    else {
      url = formatPathAsUrl(__dirname, 'index.html');
    }

    super.load(url);
  }

  /** Send the app launch timing stats to the renderer. */
  sendLaunchTimingStats(stats) {
    logger.info(JSON.stringify(stats));
    this.window.webContents.send('launch-timing-stats', { stats });
  }
}
