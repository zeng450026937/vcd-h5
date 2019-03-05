import { ensureDir, readFile, readdir, readJson, outputJson } from 'fs-extra';
import { resolve, basename } from 'path';
import { getLogDirectoryPath } from '../logger/get-log-path';
import { Log } from '../ytms/uploader';

export class LogUploader {
  constructor(api) {
    this.api = api;
    this.logDir = getLogDirectoryPath();
    this.recordFile = resolve(this.logDir, 'record.json');
    this.fileMap = {}; // file, date
    this.loaded = false;
  }

  async upload(file) {
    const path = resolve(this.logDir, file);
    const logfile = await readFile(path);
    const log = new Log(this.api);

    log.addParam({ sessionId: 'why!!!' });
    log.addLog(logfile, `${basename(path)}.gz`);

    await log.upload();
  }

  async walkAndUpload() {
    await this.load();

    const files = await readdir(this.logDir);

    await Promise.all(
      files.map(async(file) => {
        // is uploaded
        if (this.fileMap[file]) return;
        // is log file
        if (file.indexOf('.log') === -1) return;
  
        await this.upload(file)
          .then(() => {
            this.fileMap[file] = Date.now();
          })
          .catch(() => {});
      })
    );

    await this.save();
  }

  async packAndUpload(filename) {
    return filename;
  }

  async save() {
    await this.load();

    await outputJson(this.recordFile, this.fileMap);
  }

  async load() {
    if (this.loaded) return;

    await ensureDir(this.logDir);

    this.fileMap = await readJson(this.recordFile).catch(() => ({}));

    this.loaded = true;
  }
}
