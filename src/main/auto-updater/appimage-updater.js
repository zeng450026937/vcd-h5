import { AppUpdater } from './app-updater';

export class AppImageUpdater extends AppUpdater {
  get appSuffix() {
    return '.AppImage';
  }
}
