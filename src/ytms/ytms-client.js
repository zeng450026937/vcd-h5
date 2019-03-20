import { EventEmitter } from 'events';
import { createApi } from './create-api';
import { waitFor, calcWaitingTime } from './wait-for';

export class YTMSClient extends EventEmitter {
  constructor(baseURL, clientId) {
    super();

    this.api = createApi(baseURL, clientId);

    this.enterpriseInfo = null;
    this.isReady = false;
    this.isStop = false;
    this.retryTimes = 0;
    this.maxRetryTimes = 0;
  }

  get baseURL() {
    return this.api.baseURL;
  }

  get clientId() {
    return this.api.clientId;
  }

  // alias for getEnterpriseInfo()
  // check whether url is connectable
  async ping() {
    return this.getEnterpriseInfo();
  }

  async whenReady() {
    if (this.isReady) return;

    return new Promise((resolve) => {
      this.once('ready', () => resolve());
    });
  }

  // check register
  async check() {
    if (this.isReady) return;

    await this.getEnterpriseInfo();

    const status = await this.api.getClientStatus();

    if (!status || !status.exist) {
      // reset with full info
      await this.api.resetClientInfo({ clientId: this.clientId });
    }

    this.isReady = true;
    
    this.emit('ready');
  }

  async start(wait) {
    if (wait) {
      await waitFor(wait);
    }

    if (this.isStop) return;

    // ignore anyway, we will check isReady instead.
    await this.check().catch((e) => {
      this.emit('failed', e);
    });

    if (!this.isReady) {
      this.retryTimes++;

      if (this.maxRetryTimes && this.maxRetryTimes < this.retryTimes) {
        return;
      }

      return this.start(calcWaitingTime(this.retryTimes));
    }
    // start heartbeat
    this.isStop = false;

    this.heartbeat();
  }

  stop(stop = true) {
    // stop heartbeat
    this.isStop = stop;
    this.isReady = false;
  }

  async heartbeat(wait) {
    if (this.isStop) return;

    if (wait) {
      await waitFor(wait);
    }

    await this.api.heartbeat();

    this.emit('heartbeat');

    this.heartbeat(250 * 1000).catch(() => {});
  }

  async getEnterpriseInfo() {
    this.enterpriseInfo = await this.api.getEnterpriseInfo();

    this.emit('enterprise-info', this.enterpriseInfo);

    return this.enterpriseInfo;
  }

  async updateInfo(data) {
    // ensure clientId is matched
    data.clientId = this.clientId;

    return this.api.updateClientInfo(data);
  }

  onEnterpriseInfo(fn) {
    if (!fn) return;
    this.on('enterprise-info', fn);
  }
}
