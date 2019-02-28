import { NSISUpdater } from './nsis-updater';

let updater;

export function loadPlatformUpdater() {
  if (updater) return updater;

  switch (process.platform) {
    case 'win32':
      updater = new NSISUpdater();
      break;
    case 'darwin':
      break;
    default:
      break;
  }

  return updater;
}

export const autoUpdater = loadPlatformUpdater();
export default autoUpdater;
