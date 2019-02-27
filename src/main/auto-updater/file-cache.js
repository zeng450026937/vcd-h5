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
    this.fileMap = {}; // url, path
    this.loaded = false;

    this.load();
  }

  resolvePath(...args) {
    return resolve(this.cacheDir, ...args);
  }

  async gen(name) {
    const path = resolve(this.cacheDir, name);

    await ensureFile(path);

    return path;
  }

  async add(url, info) {
    await this.load();
    
    const path = resolve(this.cacheDir, info.path);

    await pathExists(path);

    this.fileMap[url] = info;

    await outputJson(this.cacheFile, this.fileMap);
  }

  async remove(url) {
    await this.load();

    if (!this.fileMap[url]) return;

    const path = resolve(this.cacheDir, this.fileMap[url].path);

    await unlink(path).catch(() => {}); // ignore error

    delete this.fileMap[url];

    await outputJson(this.cacheFile, this.fileMap);
  }

  async find(url) {
    await this.load();

    const info = this.fileMap[url];

    if (!info) return;

    const path = resolve(this.cacheDir, info.path);
    const exist = await pathExists(path);

    if (!exist) {
      await this.remove(url);

      return;
    }

    return info;
  }

  async clear() {
    await this.load();
    await emptyDir(this.cacheDir);
    
    this.fileMap = {};
  }

  async load() {
    if (this.loaded) return;

    await ensureDir(this.cacheDir);

    this.fileMap = await readJson(this.cacheFile).catch(() => ({}));

    this.loaded = true;
  }
}
