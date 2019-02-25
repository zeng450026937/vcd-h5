import { join, resolve } from 'path';
import { homedir } from 'os';
import { app } from 'electron';

export function getAppCacheDir() {
  const dir = homedir();

  let result;

  if (process.platform === 'win32') {
    result = process.env.LOCALAPPDATA || join(dir, 'AppData', 'Local');
  }
  else if (process.platform === 'darwin') {
    result = join(dir, 'Library', 'Application Support', 'Caches');
  }
  else {
    result = process.env.XDG_CACHE_HOME || join(dir, '.cache');
  }
  
  return result;
}
