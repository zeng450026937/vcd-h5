import { BrowserWindow, ipcMain, Menu, app, powerSaveBlocker } from 'electron';
import { EventEmitter } from 'events';
import Path from 'path';
import delegate from 'delegates';
import { now, formatPathAsUrl } from './utils';

let windowStateKeeper = null;

export class AppWindow extends EventEmitter {
  constructor() {
    super();

    this.window = null;
    this.blocker = null;
    this.loadTime = null;
    this.rendererReadyTime = null;
    this.quitting = false;

    this.minWidth = 1120;
    this.minHeight = 630;

    if (!windowStateKeeper) {
      // `electron-window-state` requires Electron's `screen` module, which can
      // only be required after the app has emitted `ready`. So require it
      // lazily.
      /* eslint-disable global-require */
      windowStateKeeper = require('electron-window-state');
    }

    this.blocker = powerSaveBlocker.start('prevent-app-suspension');

    const savedWindowState = windowStateKeeper({
      defaultWidth  : this.minWidth,
      defaultHeight : this.minHeight,
    });

    const windowOptions = {
      x               : savedWindowState.x,
      y               : savedWindowState.y,
      width           : savedWindowState.width,
      height          : savedWindowState.height,
      minWidth        : this.minWidth,
      minHeight       : this.minHeight,
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

    if (__DARWIN__) {
      windowOptions.titleBarStyle = 'hidden';
    }
    else if (__WIN32__) {
      windowOptions.frame = false;
    }
    else if (__LINUX__) {
      windowOptions.icon = Path.resolve(__public, 'favicon.png');
    }

    this.window = new BrowserWindow(windowOptions);
    savedWindowState.manage(this.window);

    app.on('before-quit', () => {
      this.quitting = true;
      if (powerSaveBlocker.isStarted(this.blocker)) {
        powerSaveBlocker.stop(this.blocker);
        this.blocker = null;
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

    if (__WIN32__) {
      // workaround for known issue with fullscreen-ing the app and restoring
      // is that some Chromium API reports the incorrect bounds, so that it
      // will leave a small space at the top of the screen on every other
      // maximize
      //
      // adapted from https://github.com/electron/electron/issues/12971#issuecomment-403956396
      //
      // can be tidied up once https://github.com/electron/electron/issues/12971
      // has been confirmed as resolved
      this.window.once('ready-to-show', () => {
        this.window.on('unmaximize', () => {
          setTimeout(() => {
            const bounds = this.window.getBounds();

            bounds.width += 1;
            this.window.setBounds(bounds);
            bounds.width -= 1;
            this.window.setBounds(bounds);
          }, 5);
        });
      });
    }

    delegate(this, 'window')
      .method('isMinimized')
      .method('isVisible')
      .method('restore')
      .method('focus')
      .method('show')
      .method('destroy');
  }

  /** Is the page loaded and has the renderer signalled it's ready? */
  get rendererLoaded() {
    return !!this.loadTime && !!this.rendererReadyTime;
  }

  load() {
    let startLoad = 0;

    // We only listen for the first of the loading events to avoid a bug in
    // Electron/Chromium where they can sometimes fire more than once. See
    // See
    // https://github.com/desktop/desktop/pull/513#issuecomment-253028277. This
    // shouldn't really matter as in production builds loading _should_ only
    // happen once.
    this.window.webContents.once('did-start-loading', () => {
      this.rendererReadyTime = null;
      this.loadTime = null;

      startLoad = now();
    });

    this.window.webContents.once('did-finish-load', () => {
      if (process.env.NODE_ENV === 'development') {
        this.window.webContents.openDevTools();
      }

      this.loadTime = now() - startLoad;

      this.maybeEmitDidLoad();
    });

    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.setVisualZoomLevelLimits(1, 1);
    });

    this.window.webContents.on('did-fail-load', () => {
      this.window.webContents.openDevTools();
      this.window.show();
    });

    this.window.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown') {
        switch (input.key) {
          case 'F12':
            this.window.webContents.toggleDevTools();
            break;
          default:
            break;
        }
      }
    });

    // TODO: This should be scoped by the window.
    ipcMain.once(
      'renderer-ready',
      (event, readyTime) => {
        this.rendererReadyTime = readyTime;
        this.maybeEmitDidLoad();
      }
    );

    this.window.on('focus', () => this.window.webContents.send('focus'));
    this.window.on('blur', () => this.window.webContents.send('blur'));

    let url = null;

    if (process.env.NODE_ENV === 'development') {
      url = process.env.WEBPACK_DEV_SERVER_URL;
    }
    else {
      url = formatPathAsUrl(__dirname, 'index.html');
    }

    this.window.loadURL(url);
  }

  /** Send the app launch timing stats to the renderer. */
  sendLaunchTimingStats(stats) {
    logger.info(JSON.stringify(stats));
    this.window.webContents.send('launch-timing-stats', { stats });
  }

  maybeEmitDidLoad() {
    if (!this.rendererLoaded) {
      return;
    }

    this.emit('did-load', null);
  }

  onClose(fn) {
    if (!fn) return;
    this.window.on('closed', fn);
  }

  onDidLoad(fn) {
    if (!fn) return;

    return this.on('did-load', fn);
  }
}
