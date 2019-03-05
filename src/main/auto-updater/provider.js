import { EventEmitter } from 'events';
import { Transform } from 'stream';
import { randomBytes, createHash } from 'crypto';
import { createWriteStream } from 'fs-extra';
import { basename } from 'path';
import axios from 'axios';
import { FileCache } from './file-cache';

export class DigestTransform extends Transform {
  constructor(expected, algorithm = 'md5', encoding = 'hex') {
    super();

    this.expected = expected;
    this.algorithm = algorithm;
    this.encoding = encoding;
    this.actual = null;
    this.digester = createHash(algorithm);
  }

  _transform(chunk, encoding, callback) {
    this.digester.update(chunk);
    callback(null, chunk);
  }

  _flush(callback) {
    this.actual = this.digester.digest(this.encoding);

    const valid = this.validate();

    console.log(this.actual, this.expected);

    if (!valid) return callback(new Error(`${this.algorithm} checksum mismatch`));

    callback(null);
  }

  validate() {
    if (!this.expected) return true;
    if (!this.actual) return false;

    return this.actual.toUpperCase() === this.expected.toUpperCase();
  }
}

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

  async download(file, dist) {
    this.cancelToken = axios.CancelToken.source();
    
    const res = await axios({
      url          : file.url,
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

    streams.push(new ProgressTransform(
      Number.parseInt(contentLength, 10), this
    ));

    if (file.md5) {
      streams.push(new DigestTransform(file.md5));
    }

    const fileStream = createWriteStream(dist);

    streams.push(fileStream);

    let finalStream = data;
    
    return new Promise((resolve, reject) => {
      streams.forEach((stream) => {
        finalStream = finalStream.pipe(stream);
        stream.once('error', (e) => {
          if (!this.cancelToken.token.reason) {
            this.onDownloadError(e);
          }
          reject(e);
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
    this.cancelToken = null;
    this.state = DOWNLOAD_STATE.DONE;
    this.emit('downloaded', info);
  }

  onDownloadError(e) {
    this.cancelToken = null;
    this.state = DOWNLOAD_STATE.FAILED;
    this.emit('download-error', e);
  }
}

export class Provider extends Downloader {
  constructor(appUpdater) {
    super();

    this.appUpdater = appUpdater;
    this.fileCache = new FileCache();

    this.feedURL = null;
    this.channel = 'stable'; // insiders, fast, stable
    this.clientId = randomBytes(32).toString('hex'); // used for Staged Rollouts
    this.latestVersion = null;
    this.latestFile = null;
  }

  get isDownloading() {
    return this.state === DOWNLOAD_STATE.PROGRESS;
  }

  get latestVersionDownloaded() {
    return this.latestFile && this.latestFile.path;
  }

  get currentVersion() {
    return this.appUpdater.appVersion;
  }

  async getLatestVersion() {
    return this.latestVersion;
  }

  async download(info) {
    if (!info) {
      info = this.latestVersion || await this.getLatestVersion();
    }

    if (!info) throw new Error('Missing download info');

    // TODO: sanityCheck here

    const { file, version } = info;

    if (!file.url) return;

    // find file in cache
    const cachedFile = await this.fileCache.find(file.url);

    if (cachedFile && cachedFile.md5 === file.md5) {
      this.latestFile = cachedFile;
      this.onDownloaded(cachedFile.path);

      return cachedFile;
    }

    const { appName, appVersion, appSuffix } = this.appUpdater;

    const filename = file.name || basename(file.url)
      || `${appName}-${version || appVersion}${appSuffix}`;
  
    const path = this.fileCache.resolvePath(filename);
  
    await super.download(file, path);
  
    file.path = path;

    await this.fileCache.add(file.url, file);

    this.latestFile = file;

    return file;
  }
  

  isVersionAvariable(info) {
    return !!info;
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
