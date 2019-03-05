import electron from 'electron';
import { YealinkProvider } from './auto-updater/yealink-provider';

const USE_SQUIRREL = process.env.VUE_APP_USE_SQUIRREL && process.env.VUE_APP_USE_SQUIRREL === 'true';

const autoUpdater = USE_SQUIRREL ? electron.autoUpdater : require('./auto-updater').autoUpdater;

if (!USE_SQUIRREL && global.ytms) {
  const provider = new YealinkProvider(autoUpdater, global.ytms.yealink);

  autoUpdater.setProvider(provider);
}

global.autoUpdater = autoUpdater;
