import { getClientId, getClientInfo, clientInfo } from './client-info';
import { YTMSClient } from './ytms-client';
import { PushService } from './push-service';
import { handlePushMessage } from './handle-push-message';

const default_url = process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;

export class YTMSService {
  constructor(url = default_url) {
    this.url = url;
    this.client = null;
    this.push = null;
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
    const {
      url: pushURL,
      tenantId,
    } = client.enterpriseInfo.pushService;
    
    const push = this.push = new PushService(
      pushURL, clientId, Number.parseInt(tenantId, 10)
    );
    
    push.poll();

    handlePushMessage(push);

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

    this.url = default_url;
  }

  updateToken(token) {
    if (this.push) this.push.updateToken(token);
  }
}
