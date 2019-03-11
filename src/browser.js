import './logger/main/install';
import './ytms/install';
import './main/app-updater';
import './ipc/install';

import { app } from 'electron';
import { AppWindow } from './main/app-window';
import { handleSquirrelEvent } from './main/squirrel-updater';
import { now } from './main/utils';
import { showUncaughtException } from './main/show-uncaught-exception';
import { 
  reportGpuCrash,
  reportRendererCrash,
  reportUncaughtException,
} from './main/report-crash';

const launchTime = now();

let mainWindow = null;

let preventQuit = false;

let readyTime = null;

let onDidLoadFns = [];

function handleUncaughtException(error) {
  preventQuit = true;

  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }

  const isLaunchError = !mainWindow;

  reportUncaughtException(isLaunchError, error);
  showUncaughtException(isLaunchError, error);
}

process.on('uncaughtException', (error) => {
  handleUncaughtException(error);
});

logger.info('-- App start-up --');

const __DEV__ = process.env.NODE_ENV === 'development';

// On Windows 10, a shortcut to your app with an Application User Model ID
// must be installed to the Start Menu.
// This can be overkill during development,
// so adding node_modules\electron\dist\electron.exe
// to your Start Menu also does the trick.
// Navigate to the file in Explorer,
// right-click and 'Pin to Start Menu'.
app.setAppUserModelId(__DEV__ ? process.execPath : 'com.ylyun.meeting.vcd');

/**
 * Register a function to be called once the window has been loaded. If the
 * window has already been loaded, the function will be called immediately.
 */
function onDidLoad(fn) {
  if (onDidLoadFns) {
    onDidLoadFns.push(fn);
  }
  else if (mainWindow) {
    fn(mainWindow);
  }
}

let handlingSquirrelEvent = false;

if (__WIN32__ && process.argv.length > 1) {
  const arg = process.argv[1];

  const promise = handleSquirrelEvent(arg);

  if (promise) {
    handlingSquirrelEvent = true;
    promise
      .catch((e) => {
        console.error(`Failed handling Squirrel event: ${arg}`, e);
      })
      .then(() => {
        app.quit();
      });
  }
}

function createWindow() {
  const window = new AppWindow();

  window.onClose(() => {
    mainWindow = null;
    if (!__DARWIN__ && !preventQuit) {
      app.quit();
    }
  });

  window.onDidLoad(() => {
    window.show();
    window.focus();
    window.sendLaunchTimingStats({
      mainReadyTime     : readyTime,
      loadTime          : window.loadTime,
      rendererReadyTime : window.rendererReadyTime,
    });

    onDidLoadFns.forEach((fn) => {
      fn(window);
    });

    onDidLoadFns = null;
  });

  window.onCrashed((killed) => {
    if (killed) {
      logger.info('renderer-process is killed by user');
    }
    reportRendererCrash();
  });

  window.load();

  mainWindow = window;
}

let hasInstanceLock = false;

if (!handlingSquirrelEvent) {
  hasInstanceLock = app.requestSingleInstanceLock();

  if (!hasInstanceLock) {
    app.quit();
  }
  else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        mainWindow.restoreWindow();
      }
    });
        
    app.on('ready', () => {
      if (handlingSquirrelEvent) {
        return;
      }

      readyTime = now() - launchTime;
      
      createWindow();

      ytms.yealink.connect()
        .then((service) => {
          logger.info(`yealink ytms connected, url: ${service.url}`);
        });
    });
    
    app.on('gpu-process-crashed', (event, killed) => { 
      if (killed) {
        logger.info('gpu-process is killed by user');
      }
      reportGpuCrash();
    });
    
    app.on('activate', () => {
      onDidLoad((window) => {
        window.show();
      });
    });
        
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      event.preventDefault();
      callback(true);
    });
    
    app.on('select-client-certificate', (event, webContents, url, list, callback) => {
      event.preventDefault();
      callback(list[0]);
    });
  }
}
