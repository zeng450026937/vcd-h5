import { readFile, unlink } from 'fs-extra';
import { basename } from 'path';
import { Job } from './job';
import { Log } from './uploader';
import { packLog } from '../logger/pack-log';

export class LogJob extends Job {
  async start() {
    super.start();

    const path = await packLog(this.id);
    
    const logfile = await readFile(path);
  
    const log = new Log(this.api);

    log.addParam({ sessionId: this.id });
    log.addLog(logfile, basename(path));

    await log.upload().catch((e) => console.log(e));
    // ignore anyway
    await unlink(path).catch(() => {});

    this.stop();
  }
}
