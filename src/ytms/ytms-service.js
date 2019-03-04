import { getClientId, getClientInfo, clientInfo } from './client-info';
import { YTMSClient } from './ytms-client';
import { PushService } from './push-service';

const default_url = process.env.VUE_APP_YTMS_URL;

// TODO: rename to YTMSServiceManager
export class YTMSService {
  constructor() {
    this.services = {};
    this.clientInfo = clientInfo;
  }

  get clientId() {
    return this.clientInfo.clientId;
  }

  async getClientId() {
    return getClientId();
  }

  async getClientInfo() {
    return getClientInfo();
  }

  async connect(url = default_url) {    
    // disconnect first
    this.disconnect(url);

    const service = this.services[url] = {};

    // prepare client
    const clientId = await getClientId();

    const client = new YTMSClient(url, clientId);

    client.start();

    service.client = client;
    service.api = client.api;
    service.clientId = client.clientId;

    await client.whenReady();

    service.enterpriseInfo = client.enterpriseInfo;

    // prepare push service
    const {
      url: pushURL,
      tenantId,
    } = client.enterpriseInfo.pushService;

    const push = new PushService(pushURL, clientId, Number.parseInt(tenantId, 10));

    push.poll();

    service.push = push;
    service.pushURL = pushURL;
    service.tenantId = tenantId;

    return service;
  }

  disconnect(url) {
    // disconnect all
    if (!url) {
      Object.keys(this.services).forEach((s) => this.disconnect(s));

      return;
    }

    // disconnect specific
    const service = this.services[url];

    if (!service) return;

    const { client, push } = service;

    if (client) {
      client.stop();
    }

    if (push) {
      push.stop();
    }

    delete this.services[url];
  }

  get(url = default_url) {
    return this.services[url];
  }

  getClient(url = default_url) {
    const service = this.services[url];

    return service && service.client;
  }

  getPush(url = default_url) {
    const service = this.services[url];

    return service && service.push;
  }

  getApi(url = default_url) {
    const service = this.services[url];

    return service && service.api;
  }

  has(url) {
    return !!this.services[url];
  }
}
