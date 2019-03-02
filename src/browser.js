import './logger/main/install';
import './main/app-updater';

import { app, Menu, ipcMain, BrowserWindow, shell, Tray, Notification } from 'electron';
import { AppWindow } from './main/app-window';
import { handleSquirrelEvent } from './main/squirrel-updater';
import { now } from './main/utils';
import { showUncaughtException } from './main/show-uncaught-exception';
import { log as writeLog } from './logger/winston';
import { getSystemInfo } from './utils/systemInfo';

import ClientManagement from './api-service/clientManagement';
import LogReporter from './log-reporter';
import alarmReport from './alarm-reporter';
import LogProvider from './log-provider/provider';


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

    const logReporter = new LogReporter();
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

      ipcMain.on('YTMS-notification', (event, arg) => {
        const isSupported = Notification.isSupported();

        if (!isSupported) return;

        const notification = new Notification({
          title    : 'YPUSH MESSAGE TEST',
          subtitle : arg.title,
          body     : arg.message,
        });

        notification.show();
      });

      ipcMain.on('render-crash', (event, arg) => {
        alarmReport.report(arg);
      });

      ipcMain.on('request-system-info', async(event, arg) => {
        const data = await getSystemInfo();

        event.sender.send('system-info', data);
      });
      const logProvider = new LogProvider();

      ipcMain.on('request-today-log-data', async(event, arg) => {
        const logPath = logProvider.logDirectory;
        const todayLogFile = await logProvider.getTodayLogFile();

        event.sender.send('send-log-data', { logPath, todayLogFile });
      });

      let clientManagement;

      getSystemInfo().then((systemInfo) => {
        clientManagement = new ClientManagement(systemInfo);
      });

      ipcMain.on('after-login', (event, arg) => {
        clientManagement.accountInfo = arg;
        clientManagement.state = 1;
      });
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
