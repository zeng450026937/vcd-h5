import { getSystemId } from './system-info';
import { YTMSClient } from './ytms-client';
import { getEnterpriseInfo } from './ytms-api';

const YEALINK_URL = 'http://ytms.yealink.com:1234';
const clients = {};

connectYTMS();

export async function connectYTMS(enterpriseUrl, yealinkUrl = YEALINK_URL) {
  // get systemId as clientId
  const systemId = await getSystemId();

  let enterpriseInfo;

  // connect to enterprise
  if (enterpriseUrl) {
    const info = await getEnterpriseInfo(enterpriseUrl);

    enterpriseInfo = info;
    
    const client = new YTMSClient(enterpriseUrl, systemId);

    await client.check();

    client.start();

    await client.updateInfo(enterpriseInfo);

    clients[enterpriseUrl] = client;
  }

  // connect to yealink
  if (yealinkUrl) {
    const client = new YTMSClient(yealinkUrl, systemId);

    await client.check();

    client.start();

    await client.updateInfo(enterpriseInfo);

    clients[yealinkUrl] = client;
  }

  // start push-service
}
