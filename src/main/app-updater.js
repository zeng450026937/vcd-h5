import electron from 'electron';

const USE_SQUIRREL = process.env.VUE_APP_USE_SQUIRREL && process.env.VUE_APP_USE_SQUIRREL === 'true';

global.autoUpdater = USE_SQUIRREL ? electron.autoUpdater : require('./auto-updater').autoUpdater;
