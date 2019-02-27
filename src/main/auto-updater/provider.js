import { EventEmitter } from 'events';
import { Transform } from 'stream';
import { createWriteStream } from 'fs-extra';
import axios from 'axios';
import { resolve as resolvePath } from 'path';
import { getAppCacheDir } from './file-cache';

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
    const { cancelToken } = this.downloader;

    if (cancelToken && cancelToken.token.reason) {
      callback(new Error('Cancelled'), null);
    }

    this.received += chunk.length;
    this.delta += chunk.length;

    const now = Date.now();

    if (now >= this.nextUpdate && this.received !== this.total /* will be emitted on _flush */) {
      this.nextUpdate = now + this.threshold;

      this.downloader.onProgress({
        total          : this.total,
        delta          : this.delta,
        received       : this.received,
        percent        : (this.received / this.total) * 100,
        bytesPerSecond : Math.round(this.received / ((now - this.startTime) / this.threshold)),
      });

      this.delta = 0;
    }

    callback(null, chunk);
  }

  _flush(callback) {
    const { cancelToken } = this.downloader;

    if (cancelToken && cancelToken.token.reason) {
      callback(new Error('Cancelled'), null);
    }

    this.endTime = Date.now();

    this.downloader.onProgress({
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

    const { data, headers } = res;
    const contentLength = headers['content-length'];

    if (!contentLength || contentLength <= 0) throw new Error('Wrong Length');

    const streams = [];
    const progressStream = new ProgressTransform(
      Number.parseInt(contentLength, 10), this
    );
    const fileStream = createWriteStream(dist);

    streams.push(progressStream);
    streams.push(fileStream);

    let finalStream = data;
    
    return new Promise((resolve, reject) => {
      streams.forEach((stream) => {
        finalStream = finalStream.pipe(stream);
        stream.once('error', (e) => {
          this.onDownloadError(e);
          reject();
        });
      });

      fileStream.once('finish', () => {
        this.onDownloaded(dist);
        resolve(dist);
      });
    });
  }

  cancel() {
    if (this.cancelToken) return this.cancelToken.cancel();
  }

  onProgress(info) {
    this.state = DOWNLOAD_STATE.PROGRESS;
    this.emit('download-progress', info);
  }

  onDownloaded(info) {
    this.state = DOWNLOAD_STATE.DONE;
    this.emit('downloaded', info);
  }

  onDownloadError(e) {
    this.state = DOWNLOAD_STATE.FAILED;
    this.emit('download-error', e);
  }
}

export class Provider extends Downloader {
  constructor(appUpdater) {
    super();
    this.appUpdater = appUpdater;
    this.latestVersion = null;
  }

  get isDownloading() {
    return this.state === DOWNLOAD_STATE.PROGRESS;
  }

  async getLatestVersion() {
    return this.latestVersion;
  }

  async download(info) {
    if (!info) {
      info = this.latestVersion || await this.getLatestVersion();
    }

    if (!info) throw new Error('Missing download info');

    // TODO: should add a default packageName, eg. 'vcd.exe'
    const { downloadUrl, packageName } = info;

    if (!downloadUrl) return;

    const path = resolvePath(getAppCacheDir(), packageName);

    return super.download(downloadUrl, path);
  }
  
  onProgress(info) {
    super.onProgress(info);
    if (this.appUpdater) {
      this.appUpdater.emit('download-progress', info);
    }
  }

  onDownloaded(info) {
    super.onDownloaded(info);
    if (this.appUpdater) {
      this.appUpdater.emit('downloaded', info);
    }
  }

  onDownloadError(e) {
    super.onDownloadError(e);
    if (this.appUpdater) {
      this.appUpdater.emit('download-error', e);
    }
  }
}
