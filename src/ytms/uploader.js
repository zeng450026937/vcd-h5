import FormData from 'form-data';
import delegates from 'delegates';

const PAYLOAD_TYPE = {};

PAYLOAD_TYPE[PAYLOAD_TYPE.ALARM = 0] = 'ALARM';
PAYLOAD_TYPE[PAYLOAD_TYPE.LOG = 1] = 'LOG';
PAYLOAD_TYPE[PAYLOAD_TYPE.NETLOG = 2] = 'NETLOG';
PAYLOAD_TYPE[PAYLOAD_TYPE.CONFIG = 3] = 'CONFIG';
PAYLOAD_TYPE[PAYLOAD_TYPE.FEEDBACK = 4] = 'FEEDBACK';

export class Payload {
  constructor(api, data) {
    this.api = api;
    this.data = data;
  }

  async upload(type) {
    if (!this.api) return;

    let res;

    switch (type) {
      case PAYLOAD_TYPE.ALARM:
        res = await this.api.doAlarm(this.data);
        break;
      case PAYLOAD_TYPE.LOG:
        res = await this.api.uploadLogs(this.data);
        break;
      case PAYLOAD_TYPE.NETLOG:
        res = await this.api.uploadNetLogs(this.data);
        break;
      case PAYLOAD_TYPE.CONFIG:
        res = await this.api.uploadConfig(this.data);
        break;
      case PAYLOAD_TYPE.FEEDBACK:
        res = await this.api.doFeedback(this.data);
        break;
      default:
        throw new Error('Unknown payload type');
    }

    return res;
  }
}

export class JsonPayload extends Payload {
  constructor(api, data) {
    super(api, data || {});
  }

  add(value) {
    if (typeof value === 'object') {
      Object.assign(this.data, value);
    }
    else {
      this.data[value] = value;
    }

    return this;
  }

  set(key, value) {
    this.data[key] = value;

    return this;
  }

  del(key) {
    delete this.data[key];

    return this;
  }
}

export class FormPayload extends Payload {
  constructor(api, data) {
    super(api, data || new FormData());

    delegates(this, 'data')
      .method('append')
      .method('getHeaders');
  }

  add(key, value, name) {
    if (typeof value === 'object') value = JSON.stringify(value);

    this.data.append(key, value, name);

    return this;
  }
}

export class Alarm extends FormPayload {
  addParam(param) {
    return this.add('param', param);
  }

  addLog(log, name = `${Date.now()}.log`) {
    return this.add('log', log, name);
  }

  upload() {
    return super.upload(PAYLOAD_TYPE.ALARM);
  }
}

export class Log extends FormPayload {
  addParam(param) {
    return this.add('param', param);
  }

  addLog(log, name = `${Date.now()}.log`) {
    return this.add('log', log, name);
  }

  upload() {
    return super.upload(PAYLOAD_TYPE.LOG);
  }
}

export class NetLog extends FormPayload {
  addParam(param) {
    return this.add('param', param);
  }

  addLog(log, sessionId) {
    this.add('param', { sessionId });
    this.add('packet', log, `${sessionId}.json`);

    return this;
  }

  upload() {
    return super.upload(PAYLOAD_TYPE.NETLOG);
  }
}

export class Config extends JsonPayload {
  upload() {
    return super.upload(PAYLOAD_TYPE.CONFIG);
  }
}

export class Feedback extends FormPayload {
  addParam(param) {
    return this.add('param', param);
  }

  addLog(log, name = `${Date.now()}.log`) {
    return this.add('log', log, name);
  }

  addImage(log, name = `${Date.now()}.jpg`) {
    return this.add('image', log, name);
  }

  addVideo(log, name = `${Date.now()}.mp4`) {
    return this.add('video', log, name);
  }

  upload() {
    return super.upload(PAYLOAD_TYPE.FEEDBACK);
  }
}
