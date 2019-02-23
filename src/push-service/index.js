import Axios from 'axios';
import { EventEmitter } from 'events';
import Crypto from 'crypto';

const PushAction = {};

PushAction[PushAction.CHECK = 0] = 'checksync';
PushAction[PushAction.SYNC = 1] = 'sync';
PushAction[PushAction.ACK = 2] = 'ack';

const POLLING_PATH = '/api/v1/polling';
const GATEWAY_PATH = '/api/v1/gateway';

const MESSAGE_TYPE = {};

MESSAGE_TYPE[MESSAGE_TYPE.PUT_UPDATE = 0] = 'PUT_UPDATE';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_CONFIG = 1] = 'PUT_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_MESSAGE = 2] = 'PUT_MESSAGE';
MESSAGE_TYPE[MESSAGE_TYPE.GET_LOG = 3] = 'GET_LOG';
MESSAGE_TYPE[MESSAGE_TYPE.GET_CONFIG = 4] = 'GET_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.GET_NETSTAT = 5] = 'GET_NETSTAT';

export { MESSAGE_TYPE };

async function waitFor(timeout) {
  return new Promise((resolve) => {
    if (!timeout) return resolve();
    setTimeout(resolve, timeout);
  });
}

export class PushService extends EventEmitter {
  constructor(clientId) {
    super();

    this.clientId = clientId;
    this.baseURL = 'http://push.yealink.com';
    this.tatentId = 0;
    this.platform = process.platform;
    this.biz = 0; // default value
    this.appid = 'ypush';

    this.algorithm = 'sha256';
    this.key = 'yealink'; // fake value
  }

  async poll(wait) {
    if (wait) {
      await waitFor(wait);
    }

    const res = await this.post(PushAction.CHECK);

    if (!res || res.code !== undefined) return this.poll(3000);

    wait = await this.sync(res);

    return this.poll(wait);
  }

  async sync(res) {
    const sids = this.genSyncSid(res);

    res = await this.post(PushAction.SYNC, sids);

    // something error
    if (!res || res.code !== undefined) return 1000;

    sids.length = 0;

    Object.keys(res).forEach((sid) => {
      const lastSeqId = res[sid];
      const maxSeqId = this.analyze(res[sid]);
      
      sids.push({ sid, seqId: maxSeqId || lastSeqId });
    });

    await this.post(PushAction.ACK, sids);
  }

  async post(action, sids) {
    let res;
    const path = this.genPath(action);
    const url = this.baseURL + path;
    const body = this.genRequest(action, sids);
    const auth = this.sign(path);
    const sub = this.appid;
    
    try {
      res = await Axios({
        method  : 'post',
        url,
        data    : JSON.stringify(body),
        headers : {
          Accept         : 'application/json',
          'Content-Type' : 'application/json',
          Authorization  : auth,
          subscribe      : sub,
        },
        timeout : 30000,
      });
    }
    catch (error) {
      return;
    }

    return res.data;
  }

  analyze(value = []) {
    let maxSeqId = 0;

    value.forEach((data) => {
      if (!data) return;

      const { seqId = 0, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      this.analyzeConent(content);
    });

    return maxSeqId;
  }

  analyzeConent(content) {
    if (!content) return;

    const { type, body } = content;

    if (!type) return;

    this.emit(type, body);
    this.emit(MESSAGE_TYPE[type], body);
  }

  genPath(action) {
    let path;

    switch (action) {
      case PushAction.CHECK:
        path = POLLING_PATH;
        break;
      case PushAction.SYNC:
      case PushAction.ACK:
        path = GATEWAY_PATH;
        break;
      default:
        path = '';
        break;
    }

    return path;
  }

  genRequest(action, sids) {
    const body = {
      basic : this.genBasic(action),
    };

    if (sids) {
      body.sids = sids;
    }

    return body;
  }

  genBasic(action) {
    return {
      biz      : this.biz,
      action   : PushAction[action],
      tenantId : this.tatentId,
      platform : this.platform,
      clientId : this.clientId,
    };
  }

  // data from polling
  genSyncSid(data) {
    return Object.keys(data)
      .map((sid) => ({ sid, limit: 10 }));
  }

  sign(path) {
    const appid = this.appid;
    const method = 'POST';
    const random = '12345678';
    const nonce = `${new Date().valueOf()}:${random}`;

    const hmac = Crypto.createHmac(this.algorithm, this.key);

    const text = `${nonce}\n${appid}\n${method}\n${path}\n`;

    hmac.update(text);

    const signText = `appid="${appid}",nounce="${nonce}",sign="${hmac.digest('utf8')}"`;

    return signText;
  }
}
