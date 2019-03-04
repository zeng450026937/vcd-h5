import { netLog } from 'electron';
import { resolve } from 'path';
import { EventEmitter } from 'events';
import { readFile } from 'fs-extra';
import { NetLog } from './uploader';
import { getNetLogDirectoryPath } from '../logger/get-log-path';

// in seconds
const SESSION_EXPIRE_TIME = 30 * 1000;

export class Session {
  constructor(id, job) {
    this.id = id;
    this.job = job;
    this.interval = SESSION_EXPIRE_TIME * 0.9;
    this.timer = null;
    this.status = 'stop';
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.progress(), this.interval);
    this.report('start');
  }

  progress() {
    this.report('proceed', this.expire);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.report('stop');
  }

  // virtual func
  report(status) {
    if (this.job) {
      this.job.onReported(status);
    }
  }

  // private
  get expire() {
    return SESSION_EXPIRE_TIME;
  }
}

export class NetLogSession extends Session {
  constructor(id, api) {
    super(id);

    this.api = api;
  }

  report(status, expire = this.expire) {
    this.api.reportNetLogs(this.id, status, expire);
  }
}


export class Job extends EventEmitter {
  constructor(api, sessionId) {
    super();

    this.api = api;
    this.session = this.genSession(sessionId, this);
  }

  get sessionId() {
    return this.session.id;
  }

  get isRunning() {
    return this.session.status === 'start' 
    || this.session.status === 'proceed';
  }

  start() {
    this.session.start();
  }

  stop() {
    this.session.stop();
  }

  // private
  genSession(id) {
    return new Session(id);
  }

  onReported(status) {
    this.status = status;
    this.emit(this.status, this);
  }
}

export class JobManager {
  constructor() {
    this.jobs = {};
  }

  add(job) {
    if (!job) return;
    
    this.jobs[job.sessionId] = job;

    job.on('stop', (j) => {
      delete this.jobs[j.sessionId];
    });
  }

  remove(sessionId) {
    if (!sessionId) {
      Object.keys(this.jobs).forEach((j) => this.remove(j.sessionId));

      return;
    }

    const job = this.jobs[sessionId];

    if (job) {
      job.stop();
    }

    delete this.jobs[sessionId];
  }
}

export class NetLogJob extends Job {
  constructor(api, sessionId) {
    super(api, sessionId);

    // default logpath
    this.logpath = resolve(getNetLogDirectoryPath(), `${new Date()}.json`);
  }

  start(logpath) {
    if (logpath) {
      this.logpath = logpath;
    }
    netLog.startLogging(this.logpath);
    super.start();
  }

  stop() {
    netLog.stopLogging(async(path) => {
      const logfile = await readFile(path);
      const log = NetLog.Create(this.api);
  
      log.sessionId = this.sessionId;
      log.logfile = logfile;

      await log.upload();
    });
    super.stop();
  }

  genSession(id) {
    return new NetLogSession(id);
  }
}
