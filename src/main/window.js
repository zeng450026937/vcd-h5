/* eslint-disable import/no-extraneous-dependencies */
import { BrowserWindow } from 'electron';
import path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

export function createWindow(option) {
  const window = new BrowserWindow({
    option,
    width           : 1024,
    minWidth        : 1024,
    height          : 576,
    minHeight       : 576,
    show            : true,
    frame           : false,
    resizable       : true,
    backgroundColor : 'white',
    webPreferences  : { //
      nodeIntegration         : true, // 是否完整支持node
      nodeIntegrationInWorker : true, // 是否在WEB工作器中启用 Node 集成
      nativeWindowOpen        : true, // 是否使用原生的 window.open()
      webSecurity             : false, // false: 禁用同源策略
    },
  });

  if (isDevelopment) {
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    window.webContents.openDevTools({ mode: 'detach' }); // 分离 DevTools
  }
  else {
    window.loadURL(formatUrl({
      pathname : path.join(__dirname, 'index.html'),
      protocol : 'file',
      slashes  : true,
    }));
  }

  window.on('closed', () => {
    window.removeAllListeners();
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      switch (input.key) {
        case 'F12':
          window.webContents.toggleDevTools();
          break;
        default:
          break;
      }
    }
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    options.nodeintegration = false;
    options.nodeIntegrationInWorker = false;
  });

  return window;
}
