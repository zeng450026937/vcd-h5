import axios from 'axios';
import { EventEmitter } from 'events';
import { createHmac } from 'crypto';
import { waitFor, calcWaitingTime } from './wait-for';

const PUSH_ACTION = {};

PUSH_ACTION[PUSH_ACTION.CHECK = 0] = 'checksync';
PUSH_ACTION[PUSH_ACTION.SYNC = 1] = 'sync';
PUSH_ACTION[PUSH_ACTION.ACK = 2] = 'ack';

const POLLING_PATH = '/api/v1/polling';
const GATEWAY_PATH = '/api/v1/gateway';

const MESSAGE_TYPE = {};

MESSAGE_TYPE[MESSAGE_TYPE.PUT_UPDATE = 0] = 'PUT_UPDATE';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_CONFIG = 1] = 'PUT_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_MESSAGE = 2] = 'PUT_MESSAGE';
MESSAGE_TYPE[MESSAGE_TYPE.GET_LOG = 3] = 'GET_LOG';
MESSAGE_TYPE[MESSAGE_TYPE.GET_CONFIG = 4] = 'GET_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.START_NETLOG = 5] = 'START_NETLOG';
MESSAGE_TYPE[MESSAGE_TYPE.STOP_NETLOG = 6] = 'STOP_NETLOG';
MESSAGE_TYPE.PHONEBOOK_UPDATE = 'PHONEBOOK_UPDATE';
MESSAGE_TYPE.PHONEBOOK_DELETE = 'PHONEBOOK_DELETE';
MESSAGE_TYPE.PHONEBOOK_INSTER = 'PHONEBOOK_INSTER';

export { MESSAGE_TYPE };

export class PushService extends EventEmitter {
  constructor(baseURL, clientId, tenantId) {
    super();

    this.baseURL = baseURL;
    this.clientId = clientId;
    this.tenantId = tenantId;
    this.platform = process.platform;
    this.biz = 0; // default value
    this.appid = 'ypush';

    this.algorithm = 'sha256';
    this.secretKey = 'yealink'; // fake value

    this.isStop = false;
    this.retryTimes = 0;
    this.maxRetryTimes = 0;
    this.cancelToken = null;
    this.token = 'null';
  }

  stop(stop = true) {
    this.isStop = stop;
    if (this.cancelToken) {
      this.cancelToken.cancel();
      this.cancelToken = null;
    }
  }

  async poll(wait) {
    if (wait) {
      await waitFor(wait);
    }

    // ignore anyway, we will check the respones
    const res = await this.post(PUSH_ACTION.CHECK);

    if (this.isStop) return;

    if (!res) {
      return this.poll(1000);
    }

    // poll with result, got messages!
    if (!res.code) {
      wait = await this.sync(res);

      return this.poll(wait);
    }

    // poll with other error
    if (res.code !== '60600') {
      this.retryTimes += 1;

      if (this.maxRetryTimes && this.maxRetryTimes < this.retryTimes) {
        return;
      }

      return this.poll(calcWaitingTime(this.retryTimes));
    }

    // poll timeout normally
    return this.poll();
  }

  async sync(res) {
    const sids = this.genSyncSid(res);

    res = await this.post(PUSH_ACTION.SYNC, sids);

    console.log('sids res', JSON.stringify(res));

    // something error
    if (!res || res.code !== undefined) return 1000;

    sids.length = 0;

    Object.keys(res).forEach((sid) => {
      const lastSeqId = res[sid];
      const maxSeqId = this.analyze(res[sid]);
      
      sids.push({ sid, seqId: maxSeqId || lastSeqId });
    });

    await this.post(PUSH_ACTION.ACK, sids);
  }

  async post(action, sids) {
    let res;
    const path = this.genPath(action);
    const url = this.baseURL + path;
    const body = this.genRequest(action, sids);
    const auth = this.sign(path);
    const sub = this.appid;
    const contentType = 'application/json';
    
    try {
      this.cancelToken = axios.CancelToken.source();

      console.log('request params:', JSON.stringify({
        ...body,
        url,
        token : this.token,
      }));

      res = await axios({
        method  : 'post',
        url,
        data    : JSON.stringify(body),
        headers : {
          Accept         : contentType,
          'Content-Type' : contentType,
          Authorization  : auth,
          subscribe      : sub,
          token          : this.token,
        },
        timeout     : 30000,
        cancelToken : this.cancelToken.token,
      });
    }
    catch (error) {
      this.cancelToken = null;

      return;
    }

    this.cancelToken = null;

    console.log('response is:', JSON.stringify(res.data));

    return res.data;
  }

  updateToken(token) {
    console.log('update token :', token);
    this.token = token;
  }

  analyze(value = []) {
    let maxSeqId = 0;

    console.log('analyze', value);

    value.items.forEach((data) => {
      if (!data) return;

      const { seqId = 0, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      console.log('analyze data is', data);

      this.analyzeConent(content);
    });

    return maxSeqId;
  }

  analyzeConent(content) {
    console.log('content', content);

    if (!content) return;

    const { type, body } = this.parseJSON(content);

    console.log({ type, body });

    // null & undefined

    if (type == null) return;

    this.emit('notify', type, body);
  }

  genPath(action) {
    let path;

    switch (action) {
      case PUSH_ACTION.CHECK:
        path = POLLING_PATH;
        break;
      case PUSH_ACTION.SYNC:
      case PUSH_ACTION.ACK:
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
      action   : PUSH_ACTION[action],
      tenantId : this.tenantId,
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
    const nonce = `${Date.now()}:${random}`;

    const hmac = createHmac(this.algorithm, this.secretKey);

    const text = `${[ nonce, appid, method, path ].join('\n')}\n`;

    hmac.update(text);

    const digest = hmac.digest('base64');

    const signText = `appid="${appid}",nonce="${nonce}",sign="${digest}"`;

    return signText;
  }

  parseJSON(json) {
    let obj;

    try {
      obj = JSON.parse(json);
    }
    catch (e) {
      obj = {};
    }
    
    return obj;
  }
}
