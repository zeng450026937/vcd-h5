import { AppUpdater } from './app-updater';

export class DMGUpdater extends AppUpdater {
  get appSuffix() {
    return '.dmg';
  }
}
