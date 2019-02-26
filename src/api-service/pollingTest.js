import axios from 'axios';

const HTTP_CONFIG = {
  PORT : 8844,
  HOST : '10.5.200.100',
};

const BASE_URL = `http://${HTTP_CONFIG.HOST}:${HTTP_CONFIG.PORT}`;

const GATE_WAY_URL = `${BASE_URL}/api/v1/gateway`;
const POLLING_URL = `${BASE_URL}/api/v1/polling`;

const PLATFORM = 'win32';
const CLIENT_ID = '031b021c040d05c823061f0700080009';

const wait = async(timeout = 0) => new Promise((resolve) => {
  if (timeout) {
    setTimeout(() => {
      resolve();
    }, timeout);
  }
});
const genSyncRequest = (sid) => ({
  sids  : [ { sid } ],
  basic : { biz: 0, clientId: CLIENT_ID, tenantId: 1, action: 'sync', platform: PLATFORM },
});


const genPollingRequest = () => ({
  basic : {
    biz      : 0,
    action   : 'checksync',
    tenantId : 1,
    platform : PLATFORM,
    clientId : CLIENT_ID,
  },
});

const genAckRequest = (sid, maxSeqId) => ({
  sids  : [ { seqId: maxSeqId, sid } ],
  basic : { biz: 0, clientId: CLIENT_ID, tenantId: 1, action: 'ack', platform: PLATFORM },
});

const doPost = async(url, request) => {
  console.warn(`[doPost] ${JSON.stringify(request)}`);
  
  return axios({
    method  : 'post',
    url,
    data    : JSON.stringify(request),
    headers : {
      Accept         : 'application/json',
      'Content-Type' : 'application/json',
      Authorization  : 'appid="ypush",nonce="1536916245883:33333333",sign="gqZQcCDHS56Z/NTiSpmATLCcUc/cGHMlxKD46WnJgmk="',
      subscribe      : 'ypush',
    },
    timeout : 40000,
  }).then((response) => response.data, (error) => {
    console.warn(`[连接失败] ${error}`);
  });
};


const doPolling = async(request = genPollingRequest()) => {
  const result = await doPost(POLLING_URL, request);

  console.warn(`[doPolling] ${JSON.stringify(result)}`);
  
  return result;
};
const doRequest = async(request) => {
  if (!request) return;
  
  return await doPost(GATE_WAY_URL, request);
};

const run = async() => {
  // do polling
  console.warn('----------------------------------------------------');
  const pollResult = await doPolling(genPollingRequest());

  console.warn(`[pollResult] ${JSON.stringify(pollResult)}`);
  if (!pollResult) {
    await wait(3000);
  }
  else if (pollResult.hasOwnProperty('code')) {
    await wait(1000);
  }
  else {
    // do async'
    await Object.keys(pollResult).forEach(async(key) => {
      if (pollResult[key] > 0) {
        const syncRequest = genSyncRequest(key);

        console.warn(`[syncRequest] ${JSON.stringify(syncRequest)}`);
        const syncResult = await doRequest(syncRequest);

        if (syncResult) {
          console.warn(JSON.stringify(syncResult));
          await Object.keys(syncResult).forEach(async(sid) => {
            const items = syncResult[sid];

            if (items && items.length > 0) {
              const maxSeqId = items[items.length - 1].seqId;
              const ackRequest = genAckRequest(sid, maxSeqId);

              console.warn(`[FINAL ackRequest] ${JSON.stringify(ackRequest)}`);
              const ackResult = await doRequest(ackRequest);

              console.warn(`[FINAL ackResult] ${JSON.stringify(ackResult)}`);
            }
          });
        }
      }
    });
  }
  await run();
};

run().then(() => {
});
