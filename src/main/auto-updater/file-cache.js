import {
  resolve,
  basename,
} from 'path';
import {
  homedir,
} from 'os';
import {
  app,
} from 'electron';
import {
  ensureFile,
  ensureDir,
  emptyDir,
  readJson,
  outputJson,
  unlink,
  pathExists,
} from 'fs-extra';

export function getAppCacheDir(name = app.getName()) {
  const home = homedir();

  let dir;

  switch (process.platform) {
    case 'win32':
      dir = process.env.LOCALAPPDATA || resolve(home, 'AppData', 'Local', name);
      break;
    case 'darwin':
      dir = resolve(home, 'Library', 'Application Support', 'Caches', name);
      break;
    default:
      dir = process.env.XDG_CACHE_HOME || resolve(home, '.cache', name);
      break;
  }

  return dir;
}

export class FileCache {
  constructor(cacheDir) {
    this.cacheDir = cacheDir || resolve(getAppCacheDir(), 'FileCache');
    this.cacheFile = resolve(cacheDir, 'cache-file.json');
    this.fileMap = {}; // name, path
    this.loaded = false;

    this.load();
  }

  async gen(name) {
    const path = resolve(this.cacheDir, name);

    await ensureFile(path);

    return path;
  }

  async add(name) {
    await this.load();
    
    const path = resolve(this.cacheDir, name);

    await pathExists(path);

    name = basename(path);

    this.fileMap[name] = path;

    await outputJson(this.cacheFile);
  }

  async remove(name) {
    const path = resolve(this.cacheDir, name);

    await unlink(path).catch(() => {}); // ignore error

    delete this.fileMap[name];

    await outputJson(this.cacheFile);
  }

  async find(name) {
    const path = resolve(this.cacheDir, name);
    const exist = await pathExists(path);

    if (exist && this.fileMap.name && this.fileMap.name === path) {
      return path;
    }

    await this.remove(name);

    return null;
  }

  async clear() {
    await emptyDir(this.cacheDir);
  }

  async load() {
    if (this.loaded) return;

    await ensureDir(this.cacheDir);

    this.fileMap = await readJson(this.cacheFile).catch(() => ({}));

    this.loaded = true;
  }
}
