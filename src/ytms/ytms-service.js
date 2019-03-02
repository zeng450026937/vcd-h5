import { getClientId } from './client-info';
import { YTMSClient } from './ytms-client';
import { PushService } from './push-service';
import { handlePushMessage } from './handle-push-message';

const default_url = process.env.VUE_APP_YTMS_URL;

// TODO: rename to YTMSServiceManager
export class YTMSService {
  constructor() {
    this.services = {};
  }

  async connect(url = default_url) {    
    // disconnect first
    this.disconnect(url);

    const service = {};

    // prepare client
    const clientId = await getClientId();

    const client = new YTMSClient(url, clientId);

    client.start();

    await client.whenReady();

    service.client = client;
    service.api = client.api;
    service.clientId = client.clientId;

    // prepare push service
    const {
      url: pushURL,
      tenantId,
    } = client.enterpriseInfo.pushService;

    const push = new PushService(pushURL, clientId, Number.parseInt(tenantId, 10));

    push.poll();

    handlePushMessage(push);

    service.push = push;
    service.pushURL = pushURL;
    service.tenantId = tenantId;

    this.services[url] = service;

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

  has(url) {
    return !!this.services[url];
  }
}
