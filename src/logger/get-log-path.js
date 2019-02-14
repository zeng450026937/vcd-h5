import * as Path from 'path';
import { app } from 'electron';

let logDirectoryPath = null;

export function getLogDirectoryPath() {
  if (!logDirectoryPath) {
    const userData = app.getPath('userData');

    logDirectoryPath = Path.join(userData, 'logs');
  }

  return logDirectoryPath;
}
