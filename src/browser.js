import './logger/main/install';
import './ytms/install';
import './main/app-updater';

import { app, ipcMain } from 'electron';
import { AppWindow } from './main/app-window';
import { handleSquirrelEvent } from './main/squirrel-updater';
import { now } from './main/utils';
import { showUncaughtException } from './main/show-uncaught-exception';
import { 
  reportGpuCrash,
  reportRendererCrash,
  reportUncaughtException,
} from './main/report-crash';
import { log as writeLog } from './logger/winston';
import { getLogDirectoryPath } from './logger/get-log-path';

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
    if (killed) return;
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

      ytms.yealink.connect();

      ipcMain.on(
        'log',
        (event, level, message) => {
          writeLog(level, message);
        }
      );

      ipcMain.on('get-clientid', async(event) => {
        const id = await ytms.getClientId();
        
        event.sender.send('get-clientid-reply', true, id);
      });

      ipcMain.on('start-ytms-service', async(event, url) => {
        const service = await ytms.enterprise.connect(url);
  
        event.sender.send('start-ytms-service-reply', true, service.clientId);
          
        // update client info
        ytms.clientInfo.enterprise = service.enterpriseInfo;
        
        // update enterprise info to yealink
        ytms.yealink.updateInfo(ytms.clientInfo);

        // replace default service to yealink provider
        autoUpdater.provider.service = ytms.enterprise;
      });

      ipcMain.on('get-log-directory', async(event) => {
        event.sender.send('get-log-directory-reply', getLogDirectoryPath());
      });

      ipcMain.on('stop-ytms-service', (event, url) => {
        ytms.enterprise.disconnect(url);
        
        event.sender.send('stop-ytms-service-reply', true);
      });
    });
    
    app.on('gpu-process-crashed', (event, killed) => {  
      if (killed) return;
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
