import { EventEmitter } from 'events';

// in seconds
const SESSION_EXPIRE_TIME = 30 * 1000;
const MAX_SESSION_LIFETIME = 3600 * 1000;

export class Session extends EventEmitter {
  constructor(id) {
    super();

    this.id = id;
    this.interval = SESSION_EXPIRE_TIME * 0.7;
    this.timer = null;
    this.status = 'stop';
    this.startTime = 0;
    this.endTime = 0;
    this.lifetime = MAX_SESSION_LIFETIME;
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
    this.report('stop');
  }

  report(status) {
    this.status = status;
    this.emit(status, this);
  }

  // private
  get expire() {
    return SESSION_EXPIRE_TIME;
  }
}

export class Job extends Session {
  constructor(api, id) {
    super(id);

    this.api = api;
  }

  report(status) {
    super.report(status);
    console.log(`job: ${this.id}`, `-- ${status} ${this.duration ? `duration: ${this.duration / 1000} s` : ''} `);
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
