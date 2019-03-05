import delegates from 'delegates';
import { getClientId, clientInfo } from './client-info';
import { YTMSClient } from './ytms-client';
import { PushService } from './push-service';
import { handlePushMessage } from './handle-push-message';

const default_url = process.env.VUE_APP_YTMS_URL;

export class YTMSService {
  constructor(url = default_url) {
    this.url = url;
    this.client = null;
    this.push = null;

    delegates(this, 'client')
      .method('updateInfo')
      .getter('api')
      .getter('isReady')
      .getter('clientId')
      .getter('enterpriseInfo');

    delegates(this, 'push')
      .getter('baseURL')
      .getter('tenantId');
  }

  getClientId() {
    return getClientId();
  }

  get clientInfo() {
    return clientInfo;
  }

  async connect(url = default_url) {
    this.url = url;

    // disconnect first
    this.disconnect();
    
    // prepare client
    const clientId = await getClientId();
    
    const client = this.client = new YTMSClient(url, clientId);
    
    client.start();
    
    await client.whenReady();

    client.updateInfo(clientInfo);
    
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
}
