/* eslint-disable import/no-extraneous-dependencies */
import { app } from 'electron';
import { createWindow } from './window';
import handleSquirrelEvent from './squirrelUpdater';

let mainWindow = null;
let handlingSquirrelEvent = false;

if (process.argv.length > 1) {
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

let hasInstanceLock = false;

// If we're handling a Squirrel event we don't want to enforce single instance.
// We want to let the updated instance launch and do its work. It will then quit
// once it's done.
if (!handlingSquirrelEvent) {
  hasInstanceLock = app.requestSingleInstanceLock();

  if (!hasInstanceLock) {
    app.quit();
  }
  else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
    
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
    
        mainWindow.focus();
      }
    });
      
    app.on('activate', () => {
      // // on macOS it is common to re-create a window even after all windows have been closed
      if (mainWindow == null) {
        mainWindow = createWindow();
      }
    });
    
    app.on('ready', () => {
      if (handlingSquirrelEvent) {
        return;
      }
    
      mainWindow = createWindow();
    });
    
    
    // quit application when all windows are closed
    app.on('window-all-closed', () => {
      // on macOS it is common for applications to stay open until the user explicitly quits
      if (process.platform !== 'darwin') {
        app.quit();
      }
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
