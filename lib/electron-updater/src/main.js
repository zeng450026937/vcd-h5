function loadUpdater() {
  let updater = null;

  switch (process.platform) {
    case 'win32':
      updater = new (require('./NsisUpdater').NsisUpdater)();
      break;
    case 'darwin':
      updater = new (require('./MacUpdater').MacUpdater)();
      break;
    default:
      updater = new (require('./AppImageUpdater').AppImageUpdater)();
      break;
  }

  return updater;
}

export const autoUpdater = loadUpdater();
export default autoUpdater;
