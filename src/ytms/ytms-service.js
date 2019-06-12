import { getClientId, getClientInfo, clientInfo } from './client-info';
import { YTMSClient } from './ytms-client';
// import { PushService } from './push-service';
import YTMSPush from './push/ytms-push';
import YConnectPush from './push/yconnect-push';

import { handlePushMessage } from './handle-push-message';

const default_url = process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;

export class YTMSService {
  constructor(url = default_url) {
    this.url = url;
    this.client = null;
    this.push = null;
    this.yconnect = null;
  }

  // use in yealink-provider
  getClientId() {
    return getClientId();
  }

  getClientInfo() {
    return getClientInfo();
  }

  get api() {
    return this.client && this.client.api;
  }

  get isReady() {
    return this.client && this.client.isReady;
  }

  get clientId() {
    return this.client && this.client.clientId;
  }

  get enterpriseInfo() {
    return this.client && this.client.enterpriseInfo;
  }

  get clientInfo() {
    return clientInfo;
  }

  get baseURL() {
    return this.push && this.push.baseURL;
  }

  get tenantId() {
    return this.push && this.push.tenantId;
  }

  updateInfo(info) {
    if (this.client) {
      this.client.updateInfo(info || clientInfo).catch(() => {});
    }
  }

  async connect(url) {
    console.warn('connect: ', url);
    // disconnect first
    this.disconnect();
    
    this.url = url || this.url;
    
    // prepare client
    const clientId = await getClientId();
    
    const client = this.client = new YTMSClient(this.url, clientId);
    
    client.start();
    
    await client.whenReady();

    // ignore error
    client.updateInfo(clientInfo).catch(() => {});

    client.reportStartUp();
    
    // prepare push service
    const { tenantId, url: baseURL } = client.enterpriseInfo.pushService;

    const push = this.push = new YTMSPush({
      baseURL,
      clientId,
      tenantId : Number.parseInt(tenantId, 10),
    });

    const yconnect = this.yconnect = new YConnectPush({
      baseURL  : YTMSService.VUE_APP_YPUSH_URL,
      clientId,
      tenantId : Number.parseInt(tenantId, 10),
    });

    push.poll();
    yconnect.poll();

    handlePushMessage(push);
    handlePushMessage(yconnect);

    return this;
  }

  disconnect() {
    if (this.client) {
      this.client.removeAllListeners();
      this.client.stop();
      this.client = null;
    }

    if (this.push) {
      this.push.removeAllListeners();
      this.push.stop();
      this.push = null;
    }
    if (this.yconnect) {
      this.yconnect.removeAllListeners();
      this.yconnect.stop();
      this.yconnect = null;
    }

    this.url = default_url;
  }

  updateToken(token) {
    if (this.push) this.push.updateToken(token);
    if (this.yconnect) this.yconnect.updateToken(token);
  }
}
