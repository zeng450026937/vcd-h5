import { NSISUpdater } from './nsis-updater';
import { DMGUpdater } from './dmg-updater';
import { AppImageUpdater } from './appimage-updater';
import { AppUpdater } from './app-updater';

let updater;

export function loadPlatformUpdater() {
  if (updater) return updater;

  switch (process.platform) {
    case 'win32':
      updater = new NSISUpdater();
      break;
    case 'darwin':
      updater = new DMGUpdater();
      break;
    case 'linux':
      updater = new AppImageUpdater();
      break;
    default:
      updater = new AppUpdater();
      break;
  }

  return updater;
}

export const autoUpdater = loadPlatformUpdater();
export default autoUpdater;
