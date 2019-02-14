import * as path from 'path';

export function getAppCacheDir() {
  const homedir = require('os').homedir();
  // https://github.com/electron/electron/issues/1404#issuecomment-194391247

  let result;

  if (process.platform === 'win32') {
    result = process.env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');
  }
  else if (process.platform === 'darwin') {
    result = path.join(homedir, 'Library', 'Application Support', 'Caches');
  }
  else {
    result = process.env.XDG_CACHE_HOME || path.join(homedir, '.cache');
  }
  
  return result;
}
