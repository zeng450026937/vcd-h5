import { EventEmitter } from 'events';
import axios from 'axios';
import { createHmac } from 'crypto';
import { sign, parseJSON } from './utils';
import { calcWaitingTime, waitFor } from '../wait-for';

export const PUSH_ACTION = {};

PUSH_ACTION[PUSH_ACTION.CHECK = 0] = 'checksync';
PUSH_ACTION[PUSH_ACTION.SYNC = 1] = 'sync';
PUSH_ACTION[PUSH_ACTION.ACK = 2] = 'ack';

export const POLLING_PATH = '/ypush/api/v1/polling';
export const GATEWAY_PATH = '/ypush/api/v1/gateway';


export default class PushService extends EventEmitter {
  constructor(options = {}) {
    super();

    this.baseURL = options.baseURL;
    this.clientId = options.clientId;
    this.tenantId = options.tenantId;
    this.platform = process.platform;
    this.biz = 0; // default value
    this.appid = 'vcs';

    this.isStop = false;
    this.retryTimes = 0;
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

    if (result.error && result.error.errorCode !== 720602) { // 720602 POLL_TIMEOUT
      console.warn('!!! POLL_TIMEOUT !!!');
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
    console.warn('result: ', result);
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
    const path = this.genPath(action);
    const url = this.baseURL + path;
    const body = this.genRequest(action, sids);
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
        'Y-Authorization' : sign({ path, appid: this.appid }),
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

    if (!data.data || Object.keys(data.data).length <= 0) await waitFor(10000); // TODO SERVER ERROR

    return data;
  }

  analyze(value = {}) {
    let maxSeqId = 0;

    const { msgType } = value;

    if (msgType == null) return maxSeqId; // msgType = 0

    value.items.forEach((data) => {
      if (!data) return;

      const { seqId = 0, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      this.analyzeContent(content, msgType);
    });

    return maxSeqId;
  }

  analyzeContent(content, msgType) {
    console.warn(content, msgType);
  }

  updateToken(token) {
    console.log('update token :', token);
    this.token = token;
  }

  genSyncSid(data) {
    return Object.keys(data).map((sid) => ({ sid, limit: 10 }));
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
}
