import { EventEmitter } from 'events';
import { getSystemId } from './system-info';
import { createApi } from './create-api';

const EXPIRE_TIME = 5 * 60 * 1000;

export class YTMSClient extends EventEmitter {
  constructor(baseURL, clientId) {
    super();

    this.api = createApi(baseURL, clientId);

    this.enterpriseId = null;
    this.isReady = false;
    this.isStop = false;
  }

  get baseURL() {
    return this.api.baseURL;
  }

  get clientId() {
    return this.api.clientId;
  }

  // check register
  async check() {
    if (this.isReady) return;

    const status = await this.api.getClientStatus();

    if (!status.exist) {
      await this.api.resetClientInfo({});
    }

    // check whether url is connectable
    this.isReady = true;
  }

  async start() {
    if (!this.isReady) {
      await this.check();
    }
    // start heartbeat
    this.isStop = false;
  }

  stop() {
    // stop heartbeat
    this.isStop = true;
  }

  async updateInfo(data) {
    return this.api.updateClientInfo(data);
  }
}
