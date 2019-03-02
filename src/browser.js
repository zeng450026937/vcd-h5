import './logger/main/install';
import './main/app-updater';
import './ytms/install';

import { app, ipcMain } from 'electron';
import { AppWindow } from './main/app-window';
import { handleSquirrelEvent } from './main/squirrel-updater';
import { now } from './main/utils';
import { showUncaughtException } from './main/show-uncaught-exception';
import { log as writeLog } from './logger/winston';
import { getClientId } from './ytms/client-info';
import { Alarm } from './ytms/uploader';

let mainWindow = null;

const launchTime = now();

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

  showUncaughtException(isLaunchError, error);
}

process.on('uncaughtException', (error) => {
  // reportError(error);
  handleUncaughtException(error);
});

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
    const ytmsService = global.ytmsService;

    if (!ytmsService) return;

    const service = ytmsService.get();

    if (!service) return;

    // TODO: handle killed
    const alarm = Alarm.Create(service.api);

    // TODO: setup alarm
    alarm.type = 'gpu-process-crashed';

    alarm.upload();
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

      ipcMain.on(
        'log',
        (event, level, message) => {
          writeLog(level, message);
        }
      );

      ipcMain.on('get-clientid', async(event) => {
        const id = await getClientId();
        
        event.sender.send('get-clientid-reply', id);
      });
    });
    
    app.on('gpu-process-crashed', (event, killed) => {
      const ytmsService = global.ytmsService;
  
      if (!ytmsService) return;
  
      const service = ytmsService.get();
  
      if (!service) return;
  
      // TODO: handle killed
      const alarm = Alarm.Create(service.api);
  
      // TODO: setup alarm
      alarm.type = 'gpu-process-crashed';
  
      alarm.upload();
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
