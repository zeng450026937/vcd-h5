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
    if (logpath) {
      this.logpath = logpath;
    }
    
    ensureDir(getNetLogDirectoryPath())
      .then(() => {
        netLog.startLogging(this.logpath);
        super.start();
      });
  }

  stop() {
    if (this.isStop) return;

    netLog.stopLogging(async(path) => {
      let logfile;

      try {
        logfile = await readFile(path);
      }
      catch (error) {
        logger.warn('failed to read netlog, path: %s error: %s', path, error);
        super.stop();
        
        return;
      }
      
      const log = new NetLog(this.api);
  
      log.addLog(logfile, this.id);

      await log.upload().catch((e) => logger.error(e));
      
      super.stop();
    });
  }
}
