import { BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';
import delegate from 'delegates';

const minWidth = 600;
const minHeight = 500;

export class CrashWindow extends EventEmitter {
  constructor(errorType, error) {
    super();

    this.window = null;
    this.errorType = null;
    this.error = null;
    
    this.hasFinishedLoading = false;
    this.hasSentReadyEvent = false;

    const windowOptions = {
      width           : minWidth,
      height          : minHeight,
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
        // Explicitly disable experimental features for the crash process
        // since, theoretically it might be these features that caused the
        // the crash in the first place. As of writing we don't use any
        // components that relies on experimental features in the crash
        // process but our components which relies on ResizeObserver should
        // be able to degrade gracefully.
        experimentalFeatures : false,
      },
    };

    if (__DARWIN__) {
      windowOptions.titleBarStyle = 'hidden';
    }
    else if (__WIN32__) {
      windowOptions.frame = false;
    }

    this.window = new BrowserWindow(windowOptions);
    this.error = error;
    this.errorType = errorType;

    delegate(this, 'window')
      .method('focus')
      .method('show')
      .method('destroy');
  }

  load() {
    // We only listen for the first of the loading events to avoid a bug in
    // Electron/Chromium where they can sometimes fire more than once. See
    // See
    // https://github.com/desktop/desktop/pull/513#issuecomment-253028277. This
    // shouldn't really matter as in production builds loading _should_ only
    // happen once.
    this.window.webContents.once('did-start-loading', () => {
      logger.debug('Crash process in startup');
    });

    this.window.webContents.once('did-finish-load', () => {
      logger.debug('Crash process started');
      if (process.env.NODE_ENV === 'development') {
        this.window.webContents.openDevTools();
      }

      this.hasFinishedLoading = true;
      this.maybeEmitDidLoad();
    });

    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.setVisualZoomLevelLimits(1, 1);
    });

    this.window.webContents.on('did-fail-load', () => {
      logger.error('Crash process failed to load');
      if (process.env.NODE_ENV === 'development') {
        this.window.webContents.openDevTools();
        this.window.show();
      }
      else {
        this.emit('did-fail-load', null);
      }
    });

    ipcMain.on('crash-ready', (event) => {
      logger.debug('Crash process is ready');

      this.hasSentReadyEvent = true;

      this.sendError();
      this.maybeEmitDidLoad();
    });

    ipcMain.on('crash-quit', (event) => {
      logger.debug('Got quit signal from crash process');
      this.window.close();
    });

    this.window.loadURL(`file://${__dirname}/crash.html`);
  }

  /**
   * Emit the `onDidLoad` event if the page has loaded and the renderer has
   * signalled that it's ready.
   */
  maybeEmitDidLoad() {
    if (this.hasFinishedLoading && this.hasSentReadyEvent) {
      this.emit('did-load', null);
    }
  }

  onClose(fn) {
    if (!fn) return;
    this.window.on('closed', fn);
  }

  onFailedToLoad(fn) {
    if (!fn) return;
    this.on('did-fail-load', fn);
  }

  /**
   * Register a function to call when the window is done loading. At that point
   * the page has loaded and the renderer has signalled that it is ready.
   */
  onDidLoad(fn) {
    if (!fn) return;
    
    return this.on('did-load', fn);
  }

  /** Report the error to the renderer. */
  sendError() {
    // `Error` can't be JSONified so it doesn't transport nicely over IPC. So
    // we'll just manually copy the properties we care about.
    const friendlyError = {
      stack   : this.error.stack,
      message : this.error.message,
      name    : this.error.name,
    };

    const details = {
      type  : this.errorType,
      error : friendlyError,
    };

    this.window.webContents.send('error', details);
  }
}
