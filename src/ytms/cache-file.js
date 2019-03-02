import { readJSON, outputJson } from 'fs-extra';
import { resolve } from 'path';

export class CacheFile {
  constructor(path) {
    this.path = resolve(process.resourcesPath, path);
    this.data = null;

    this.read();
  }

  async read() {
    this.data = await readJSON(this.path);

    return this.data;
  }

  async write(data) {
    await outputJson(this.path, data);
    this.data = data;

    return this.data;
  }
}
