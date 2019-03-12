import { EventEmitter } from 'events';

// in seconds
const SESSION_EXPIRE_TIME = 30;
const MAX_SESSION_LIFETIME = 3600;

export class Job extends EventEmitter {
  constructor(api, id) {
    super();

    this.api = api;
    this.id = id;
    this.interval = SESSION_EXPIRE_TIME * 700;
    this.timer = null;
    this.status = 'stop';
    this.startTime = 0;
    this.endTime = 0;
    this.lifetime = MAX_SESSION_LIFETIME * 1000;
    this.lifetimeTimer = null;
  }

  get duration() {
    return Math.max(this.endTime - this.startTime, 0);
  }

  get isRunning() {
    return this.status === 'start' 
    || this.status === 'proceed';
  }

  get isStop() {
    return this.status === 'stop';
  }

  start() {
    if (this.isRunning) {
      this.stop();
    }

    this.startTime = Date.now();

    this.timer = setInterval(() => this.progress(), this.interval);
    this.lifetimeTimer = setTimeout(() => this.stop(), this.lifetime);
    
    this.report('start');
  }

  progress() {
    this.report('proceed');
  }

  stop() {
    if (this.isStop) return;

    this.endTime = Date.now();

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.lifetimeTimer) {
      clearTimeout(this.lifetimeTimer);
      this.lifetimeTimer = null;
    }

    this.report('stop');
  }

  report(status) {
    this.status = status;
    if (this.api) {
      this.api.reportSessionState(this.id, { status }, this.expire);
    }
    this.emit(status, this);
    logger.info(`job: ${this.id} -- ${status} ${this.duration ? `duration: ${this.duration / 1000} s` : ''} `);
  }

  // private
  get expire() {
    return SESSION_EXPIRE_TIME;
  }
}

export class JobManager {
  constructor() {
    this.jobs = {};
  }

  add(job) {
    if (!job) return;
    
    this.jobs[job.id] = job;

    if (!job.isRunning) {
      job.start();
    }

    job.once('stop', (j) => {
      delete this.jobs[j.id];
    });
  }

  remove(id) {
    if (!id) {
      Object.keys(this.jobs).forEach((j) => this.remove(j.id));

      return;
    }

    const job = this.jobs[id];

    if (job) {
      job.stop();
    }

    delete this.jobs[id];
  }

  find(id) {
    return this.jobs[id];
  }
}
