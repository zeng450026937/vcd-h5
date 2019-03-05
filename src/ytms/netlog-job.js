import { netLog } from 'electron';
import { resolve } from 'path';
import { readFile, ensureDir } from 'fs-extra';
import { Job } from './job';
import { NetLog } from './uploader';
import { getNetLogDirectoryPath } from '../logger/get-log-path';

export class NetLogJob extends Job {
  constructor(api, id) {
    super(api, id);

    // default logpath
    this.logpath = resolve(getNetLogDirectoryPath(), `${this.id}.json`);
  }

  start(logpath) {
    super.start();

    if (logpath) {
      this.logpath = logpath;
    }

    ensureDir(getNetLogDirectoryPath())
      .then(() => {
        netLog.startLogging(this.logpath);
      });
  }

  stop() {
    if (this.isStop) return;

    super.stop();
    
    netLog.stopLogging(async(path) => {
      const logfile = await readFile(path);
      const log = new NetLog(this.api);
  
      log.addLog(logfile, this.id);

      await log.upload().catch((e) => console.log(e));
    });
  }
}
