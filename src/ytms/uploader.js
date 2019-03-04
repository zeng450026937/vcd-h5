import FormData from 'form-data';

export class Uploader {
  constructor(api) {
    this.api = api;
  }

  async upload(payload) {
    if (!payload || !this.api) return;

    let res;

    switch (payload.id) {
      case 'alarm':
        res = await this.api.doAlarm(payload.toData());
        break;
      case 'log':
        res = await this.api.uploadLogs(payload.toData());
        break;
      case 'netlog':
        res = await this.api.uploadNetLogs(payload.toData());
        break;
      case 'config':
        res = await this.api.uploadConfig(payload.toData());
        break;
      case 'feedback':
        res = await this.api.doFeedback(payload.toData());
        break;
      default:
        throw new Error('Unknown payload type');
    }

    return res;
  }
}

export class Payload {
  constructor(id, data, uploader) {
    this.id = id;
    this.data = data;
    this.uploader = uploader;
  }

  toData() {
    if (this.data instanceof FormData) return this.data;

    return null;
  }

  async upload() {
    return this.uploader.upload(this);
  }
}

export class Alarm extends Payload {
  static Create(api, data) {
    const uploader = new Uploader(api);
    const payload = new Alarm(data, uploader);

    return payload;
  }

  constructor(formdata, uploader) {
    super('alarm', formdata, uploader);

    // need default value for all props
    this.code = null;
    this.name = null;
    this.type = null;
    this.level = null;
    this.desc = null;
    this.time = null || new Date().toISOString();
    this.logfile = null;
  }

  toData() {
    let data = super.toData();

    if (data) return data;

    data = new FormData();

    data.append('param', {
      alarmCode  : this.code,
      alarmName  : this.name,
      alarmType  : this.type,
      alarmLevel : this.level,
      alarmDesc  : this.desc,
      alarmTime  : this.time,
    });

    if (this.logfile) {
      data.append('log', this.logfile);
    }

    return data;
  }
}

export class Log extends Payload {
  static Create(api, data) {
    const uploader = new Uploader(api);
    const payload = new Log(data, uploader);

    return payload;
  }

  constructor(formdata, uploader) {
    super('log', formdata, uploader);

    this.logfile = null;
  }

  toData() {
    let data = super.toData();

    if (data) return data;

    data = new FormData();

    if (this.logfile) {
      data.append('log', this.logfile);
    }

    return data;
  }
}

export class NetLog extends Payload {
  static Create(api, data) {
    const uploader = new Uploader(api);
    const payload = new NetLog(data, uploader);

    return payload;
  }

  constructor(formdata, uploader) {
    super('netlog', formdata, uploader);

    this.sessionId = null;
    this.logfile = null;
  }

  toData() {
    let data = super.toData();

    if (data) return data;

    data = new FormData();

    if (this.sessionId) {
      data.append('param', {
        sessionId : this.sessionId,
      });
    }

    if (this.logfile) {
      data.append('log', this.logfile);
    }

    return data;
  }
}

export class Config extends Payload {
  static Create(api, data) {
    const uploader = new Uploader(api);
    const payload = new Config(data, uploader);

    return payload;
  }

  constructor(data, uploader) {
    super('config', data, uploader);
  }

  toData() {
    return this.data;
  }
}

export class Feedback extends Payload {
  static Create(api, data) {
    const uploader = new Uploader(api);
    const payload = new Feedback(data, uploader);

    return payload;
  }

  constructor(formdata, uploader) {
    super('feedback', formdata, uploader);

    // need default value for all props
    this.title = null;
    this.category = null;
    this.content = null;

    this.logfile = null;
    this.image = null;
    this.video = null;
  }

  toData() {
    let data = super.toData();

    if (data) return data;

    data = new FormData();

    data.append('param', {
      feedbackTitle    : this.title,
      feedbackCategory : this.category,
      feedbackContent  : this.content,
    });

    if (this.logfile) {
      data.append('log', this.logfile);
    }
    if (this.image) {
      data.append('image', this.image);
    }
    if (this.video) {
      data.append('video', this.video);
    }

    return data;
  }
}
