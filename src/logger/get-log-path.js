import * as Path from 'path';
import { app } from 'electron';

let logDirectoryPath = null;
let netLogDirectoryPath = null;

export function getLogDirectoryPath() {
  if (!logDirectoryPath) {
    const userData = app.getPath('userData');

    logDirectoryPath = Path.join(userData, 'logs');
  }

  return logDirectoryPath;
}

export function getNetLogDirectoryPath() {
  if (!netLogDirectoryPath) {
    const userData = app.getPath('userData');

    netLogDirectoryPath = Path.join(userData, 'netlogs');
  }

  return netLogDirectoryPath;
}
