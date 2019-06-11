import axios from 'axios';
import { EventEmitter } from 'events';
import { createHmac } from 'crypto';
import { waitFor, calcWaitingTime } from './wait-for';

const PUSH_ACTION = {};

PUSH_ACTION[PUSH_ACTION.CHECK = 0] = 'checksync';
PUSH_ACTION[PUSH_ACTION.SYNC = 1] = 'sync';
PUSH_ACTION[PUSH_ACTION.ACK = 2] = 'ack';

const POLLING_PATH = '/ypush/api/v1/polling';
const GATEWAY_PATH = '/ypush/api/v1/gateway';

const MESSAGE_TYPE = {};

MESSAGE_TYPE[MESSAGE_TYPE.PUT_UPDATE = 0] = 'PUT_UPDATE';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_CONFIG = 1] = 'PUT_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.PUT_MESSAGE = 2] = 'PUT_MESSAGE';
MESSAGE_TYPE[MESSAGE_TYPE.GET_LOG = 3] = 'GET_LOG';
MESSAGE_TYPE[MESSAGE_TYPE.GET_CONFIG = 4] = 'GET_CONFIG';
MESSAGE_TYPE[MESSAGE_TYPE.START_NETLOG = 5] = 'START_NETLOG';
MESSAGE_TYPE[MESSAGE_TYPE.STOP_NETLOG = 6] = 'STOP_NETLOG';
MESSAGE_TYPE[MESSAGE_TYPE.PHONEBOOK_UPDATE = 'phonebook_update'] = 'PHONEBOOK_UPDATE';
MESSAGE_TYPE[MESSAGE_TYPE.PHONEBOOK_DELETE = 'phonebook_delete'] = 'PHONEBOOK_DELETE';
MESSAGE_TYPE[MESSAGE_TYPE.PHONEBOOK_INSTER = 'phonebook_inster'] = 'PHONEBOOK_INSTER';

MESSAGE_TYPE[MESSAGE_TYPE.SCHEDULE_UPDATE = 'SCHEDULE_1'] = 'SCHEDULE_1';
MESSAGE_TYPE[MESSAGE_TYPE.SCHEDULE_DELETE = 'SCHEDULE_2'] = 'SCHEDULE_2';
MESSAGE_TYPE[MESSAGE_TYPE.SCHEDULE_ADD = 'SCHEDULE_3'] = 'SCHEDULE_3';

export { MESSAGE_TYPE };

export class PushService extends EventEmitter {
  constructor(baseURL, clientId, tenantId) {
    super();

    this.baseURL = baseURL;
    this.clientId = clientId;
    this.tenantId = tenantId;
    this.platform = process.platform;
    this.biz = 0; // default value
    this.appid = 'vcs';

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
    if (wait) await waitFor(wait);

    const result = await this.post(PUSH_ACTION.CHECK);

    if (this.isStop) return;
    if (!result) return this.poll(1000);
    if (result.ret >= 0) {
      wait = await this.sync(result); // TODO update sync
      
      return this.poll(wait);
    }

    if (result.error && result.error.errorCode !== '720602') { // 720602 POLL_TIMEOUT
      this.retryTimes += 1;

      if (this.maxRetryTimes && this.maxRetryTimes < this.retryTimes) {
        return;
      }
      
      return this.poll(calcWaitingTime(this.retryTimes));
    }

    this.retryTimes = 0;

    // poll timeout normally
    return this.poll();
  }

  async sync(result) {
    const sids = this.genSyncSid(result.data);

    result = await this.post(PUSH_ACTION.SYNC, sids);

    // something error
    if (!result || result.ret < 0 || !result.data) return 1000;

    sids.length = 0;

    console.log('response is:', JSON.stringify(result));

    const { data } = result;

    Object.keys(data).forEach((sid) => {
      const lastSeqId = data[sid];
      const maxSeqId = this.analyze(data[sid]);
      
      sids.push({ sid, seqId: maxSeqId || lastSeqId });
    });

    await this.post(PUSH_ACTION.ACK, sids);
  }

  async post(action, sids) {
    // let res;
    const path = this.genPath(action);
    const url = this.baseURL + path;
    const body = this.genRequest(action, sids);
    const auth = this.sign(path);
    const contentType = 'application/json';

    this.cancelToken = axios.CancelToken.source();

    console.warn('request: ', url);

    const res = await axios({
      method  : 'post',
      url,
      data    : JSON.stringify(body),
      headers : {
        Accept            : contentType,
        'Content-Type'    : contentType,
        'Y-Authorization' : auth,
        token             : this.token,
      },
      timeout     : 30000,
      cancelToken : this.cancelToken.token,
    }).catch(() => {
      this.cancelToken = null;
    });

    if (!res || !res.data || this.cancelToken == null) return;

    const { data } = res;

    console.warn('response: ', JSON.stringify(data));

    this.cancelToken = null;

    return data;
  }

  updateToken(token) {
    console.log('update token :', token);
    this.token = token;
  }

  analyze(value = {}) {
    let maxSeqId = 0;

    const { msgType } = value;

    if (!msgType) return maxSeqId;

    value.items.forEach((data) => {
      if (!data) return;

      const { seqId = 0, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      this.analyzeContent(content, msgType);
    });

    return maxSeqId;
  }

  analyzeContent(content, msgType) {
    if (!content) return;

    const option = {};

    switch (msgType) {
      case 262146: { // 日程
        const { operationType, planId, sequence } = this.parseJSON(content);

        option.type = `SCHEDULE_${operationType}`;
        option.body = {
          planId, sequence,
        };
      }
        break;
      case 262145: { // 联系人
        const { type, body } = this.parseJSON(content);

        option.type = type;
        option.body = body;
      }
        break;
      default: return;
    }

    this.emit('notify', option.type, option.body);
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
