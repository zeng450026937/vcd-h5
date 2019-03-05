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
    netLog.stopLogging(async(path) => {
      const logfile = await readFile(path);
      const log = NetLog.Create(this.api);
  
      log.sessionId = this.id;
      log.logfile = logfile;

      await log.upload().catch((e) => console.log(e));
      // fire stop when upload is finished.
      super.stop();
    });
  }

  report(status) {
    super.report(status);
    
    this.api.reportNetLogs(this.id, status, this.expire);
  }
}
