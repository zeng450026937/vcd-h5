import Axios from 'axios';

const protocol = 'http://';
const address = '10.5.200.209';
const port = '9996';


export class Phonebook {
  constructor(token) {
    this.token = token;
    this.init();
  }


  updateToken(token) {
    this.token = token;
  }

  init() {
    this.acceptVersion = 'v5';
    this.apiVersion = 'v5';
    this.permissionVersion = 0;
    this.dataVersion = 0;
    this.type = [ 'STAFF', 'DEVICE', 'VMR', 'EXTERNAL_CONTACTS' ];
    this.loadMode = 'AUTO';
  }

  reset() {
    this.init();
  }

  async negotiate() {
    const path = `${protocol}${address}:${port}/negotiate`;

    const res = await Axios(
      {
        method  : 'post',
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

    const path = `${protocol}${address}:${port}/phonebook/api/${this.acceptVersion}/external/phonebook/sync`;

    let res;

    try {
      res = await Axios(
        {
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
      if (e.response.status === 503) {
        const retryAfter = Number(e.response.headers['retry-after']) * 1000;

        await this.wait(retryAfter);

        return this.sync();
      }
    }

    if (res.data.ret < 0) return Promise.reject(res);

    return res.data.data.dataList;
  }

  async search({ key }) {
    const path = `${protocol}${address}:${port}/phonebook/api/${this.acceptVersion}/external/phonebook/search`;

    const res = await Axios(
      {
        url    : path,
        method : 'get',
        params : {
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
