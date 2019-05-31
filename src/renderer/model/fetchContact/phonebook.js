import Axios from 'axios';

export class Phonebook {
  constructor({ token, baseURL }) {
    this.init({ token, baseURL });
  }

  init({ token, baseURL } = {}) {
    this.token = token;
    this.baseURL = baseURL;
    this.acceptVersion = 'v5';
    this.apiVersion = 'v5';
    this.permissionVersion = 0;
    this.dataVersion = 0;
    this.type = [ 'STAFF', 'DEVICE', 'VMR', 'EXTERNAL_CONTACTS' ];
    this.loadMode = 'AUTO';
    this.phoneBookUrl = null;
  }

  reset({ token, baseURL } = {}) {
    this.init({ token, baseURL });
  }

  updateToken(token) {
    this.token = token;
  }

  updateBaseURL(baseURL) {
    this.baseURL = baseURL;
  }

  async negotiate() {
    const path = '/negotiate';

    const res = await Axios(
      {
        method  : 'post',
        baseURL : this.baseURL,
        url     : path,
        data    : { phoneBookAcceptVersion: this.acceptVersion },
        headers : {
          token : this.token,
        },
      }
    );

    if (res.data.ret <= 0) return Promise.reject(res);

    const {
      phoneBookUrl,
      apiVersion,
      phoneBookVersion,
      type,
      phoneBookLoadMode,
    } = res.data.data;

    this.loadMode = phoneBookLoadMode || 'AUTO';
    this.phoneBookUrl = phoneBookUrl;
    this.type = type;
    this.apiVersion = apiVersion;
    if (this.acceptVersion !== phoneBookVersion) {
      this.acceptVersion = apiVersion;
    }

    return {
      phoneBookUrl,
      apiVersion,
      phoneBookVersion,
      type,
      phoneBookLoadMode,
    };
  }

  wait(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t);
    });
  }

  async sync() {
    const params = {
      dataVersion       : this.dataVersion,
      permissionVersion : this.permissionVersion,
      type              : this.type.join(','),
    };

    const path = this.phoneBookUrl
      ? `${this.phoneBookUrl}${this.acceptVersion}/external/phonebook/sync`
      : `/phonebook/api/${this.acceptVersion}/external/phonebook/sync`;

    let res;

    try {
      res = await Axios(
        {
          baseURL : this.baseURL,
          url     : path,
          method  : 'get',
          params,
          headers : {
            token : this.token,
          },
        }
      );
    }
    catch (e) {
      if (e.response && e.response.status === 503) {
        const retryAfter = Number(e.response.headers['retry-after']) * 1000;

        await this.wait(retryAfter);

        return this.sync();
      }

      return Promise.reject(e);
    }

    if (res.data.ret < 0) return Promise.reject(res);

    return res.data.data.dataList;
  }

  async search({ key }) {
    const path = this.phoneBookUrl
      ? `${this.phoneBookUrl}${this.acceptVersion}/external/phonebook/search`
      : `/phonebook/api/${this.acceptVersion}/external/phonebook/search`;

    const res = await Axios(
      {
        baseURL : this.baseURL,
        url     : path,
        method  : 'get',
        params  : {
          key,
        },
        headers : {
          token : this.token,
        },
      }
    );

    if (res.data.ret < 0) return Promise.reject(res);

    return res.data.data;
  }
}
