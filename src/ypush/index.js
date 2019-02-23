import Axios from 'axios';
import { EventEmitter } from 'events';

const YPushAction = {};

YPushAction[YPushAction.CHECK = 0] = 'checksync';
YPushAction[YPushAction.SYNC = 1] = 'sync';
YPushAction[YPushAction.ACK = 2] = 'ack';

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

export class YPush extends EventEmitter {
  constructor() {
    super();

    this.clientId = null;
    this.baseURL = null;
    this.tatentId = null;
    this.platform = process.platform;
    this.biz = 0; // default value
  }

  async poll(wait) {
    if (wait) {
      await waitFor(wait);
    }

    const res = await this.post(YPushAction.CHECK);

    if (!res || res.code !== undefined) return this.poll(3000);

    wait = await this.sync(res);

    return this.poll(wait);
  }

  async sync(res) {
    const sids = this.genSyncSid(res);

    res = await this.post(YPushAction.SYNC, sids);

    // something error
    if (!res || res.code !== undefined) return 1000;

    sids.length = 0;

    Object.keys(res).forEach((sid) => {
      const lastSeqId = res[sid];
      let maxSeqId;
      
      try {
        maxSeqId = this.analyze(res[sid]);
      }
      catch (error) {
        // log error
      }

      sids.push({ sid, seqId: maxSeqId || lastSeqId });
    });

    await this.post(YPushAction.ACK, sids);
  }

  async post(action, sids) {
    let res;
    const url = this.genUrl(action);
    const body = this.genRequest(action, sids);
    
    try {
      res = await Axios({
        method  : 'post',
        url,
        data    : JSON.stringify(body),
        headers : {
          Accept         : 'application/json',
          'Content-Type' : 'application/json',
          Authorization  : 'appid="ypush",nonce="1536916245883:33333333",sign="gqZQcCDHS56Z/NTiSpmATLCcUc/cGHMlxKD46WnJgmk="',
          subscribe      : 'ypush',
        },
        timeout : 40000,
      });
    }
    catch (error) {
      return null;
    }

    return res.data;
  }

  analyze(value = []) {
    let maxSeqId = 0;

    value.forEach((data) => {
      const { seqId, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      this.analyzeConent(content);
    });

    return maxSeqId;
  }

  analyzeConent(content) {
    const { type, body } = content;

    this.emit(type, body);
    this.emit(MESSAGE_TYPE[type], body);
  }

  genUrl(action) {
    let path;

    switch (action) {
      case YPushAction.CHECK:
        path = POLLING_PATH;
        break;
      case YPushAction.SYNC:
      case YPushAction.ACK:
        path = GATEWAY_PATH;
        break;
      default:
        path = '';
        break;
    }

    return this.baseURL + path;
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
      action   : YPushAction[action],
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
}
