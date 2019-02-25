import { EventEmitter } from 'events';
import { Transform } from 'stream';
import { ensureFile } from 'fs-extra';
import axios from 'axios';

export class ProgressTransform extends Transform {
  constructor(total, downloader) {
    super();

    this.downloader = downloader;
    this.startTime = Date.now();
    this.endTime = this.startTime;
    this.threshold = 1000;
    this.total = total;

    this.delta = 0;
    this.percent = 0;
    this.received = 0;
    this.nextUpdate = this.startTime + this.threshold;
  }

  get duration() {
    return (this.endTime - this.startTime);
  }

  get avg_speed() {
    const { duration, total } = this;

    return duration && Math.round(total / (duration / 1000));
  }

  _transform(chunk, encoding, callback) {
    const { cancelToken, onProgress } = this.downloader;

    if (cancelToken && cancelToken.token.reason) {
      callback(new Error('Cancelled'), null);
    }

    this.received += chunk.length;
    this.delta += chunk.length;

    const now = Date.now();

    if (now >= this.nextUpdate && this.received !== this.total /* will be emitted on _flush */) {
      this.nextUpdate = now + this.threshold;

      onProgress({
        total          : this.total,
        delta          : this.delta,
        received       : this.received,
        percent        : (this.received / this.total) * 100,
        bytesPerSecond : Math.round(this.received / ((now - this.start) / this.threshold)),
      });

      this.delta = 0;
    }

    callback(null, chunk);
  }

  _flush(callback) {
    const { cancelToken, onProgress } = this.downloader;

    if (cancelToken && cancelToken.token.reason) {
      callback(new Error('Cancelled'), null);
    }

    this.endTime = Date.now();

    onProgress({
      total          : this.total,
      delta          : this.delta,
      received       : this.total,
      percent        : 100,
      bytesPerSecond : this.avg_speed,
    });

    this.delta = 0;

    callback(null);
  }
}

const DOWNLOAD_STATE = {};

DOWNLOAD_STATE[DOWNLOAD_STATE.PROGRESS = 0] = 'progress';
DOWNLOAD_STATE[DOWNLOAD_STATE.DONE = 1] = 'done';
DOWNLOAD_STATE[DOWNLOAD_STATE.FAILED = 2] = 'failed';

export class Downloader extends EventEmitter {
  constructor() {
    super();
    
    this.state = DOWNLOAD_STATE.DONE;
    this.cancelToken = null;
  }

  async download(url, dist) {
    this.cancelToken = axios.CancelToken.source();
    
    const res = await axios({
      url,
      responseType : 'stream',
      headers      : {
        'User-Agent' : 'VCD-H5',
      },
      cancelToken : this.cancelToken.token,
    });

    const stream = res.data;
  }

  cancel() {
    if (this.cancelToken) return this.cancelToken.cancel();
  }

  onProgress(info) {
    this.emit('download-progress', info);
  }
}

export class Provider {
  constructor(appUpdater) {
    this.appUpdater = appUpdater;
    this.isDownloading = false;
  }

  async getLatestVersion() {
    const version = await axios({

    });

    return version;
  }

  async download() {
    if (this.isDownloading) return;

    const binary = await axios({

    });

    return binary;
  }
}
