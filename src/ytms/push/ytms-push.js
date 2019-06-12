import axios from 'axios';
import PushService, { PUSH_ACTION } from './push-service';
import { waitFor, calcWaitingTime } from '../wait-for';
import { parseJSON, sign } from './utils';

export const POLLING_PATH = '/api/v1/polling';
export const GATEWAY_PATH = '/api/v1/gateway';

export default class YTMSPush extends PushService {
  constructor(option) {
    super(option);
    this.appid = 'ypush';
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
    if (res.code !== '720602') {
      this.retryTimes += 1;

      if (this.maxRetryTimes && this.maxRetryTimes < this.retryTimes) {
        return;
      }

      return this.poll(calcWaitingTime(this.retryTimes));
    }

    this.retryTimes = 0;
    
    return this.poll();// poll timeout normally
  }

  async sync(res) {
    const sids = this.genSyncSid(res);

    res = await this.post(PUSH_ACTION.SYNC, sids);

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
    const auth = sign({ path, appid: this.appid });
    const sub = this.appid;
    const contentType = 'application/json';

    try {
      this.cancelToken = axios.CancelToken.source();

      console.log('request:', JSON.stringify({
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

    console.warn('response: ', JSON.stringify(res.data));

    this.cancelToken = null;

    return res.data;
  }

  analyze(value = []) {
    let maxSeqId = 0;

    value.items.forEach((data) => {
      if (!data) return;

      const { seqId = 0, content } = data;

      if (seqId > maxSeqId) maxSeqId = seqId;

      this.analyzeContent(content);
    });

    return maxSeqId;
  }

  analyzeContent(content) {
    if (!content) return;

    const { type, body } = parseJSON(content);

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
}
