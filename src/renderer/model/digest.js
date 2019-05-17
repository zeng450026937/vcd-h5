import Axios from 'axios';
import uuid from 'uuid';
import md5 from 'md5';
import Vuem from './vuem';


const model = new Vuem();


model.provide({
  data() {
    return {
      address  : '10.200.112.137',
      protocol : 'http://',
      port     : '9998',
      reqCount : 0,
      cnonce   : uuid.v4().replace(/-/g, ''),

    };
  },
  methods : {
    loadAccount(username, password, realm, nonce, nc, response) {
      const uri = '/user/api/v1/external/digest/login';

      let res;

      try {
        res = Axios({
          method  : 'post',
          url     : `${this.protocol}${this.address}${this.port}${uri}`,
          headers : {
            'WWW-Authenticate' : this.createDigest(username, realm, nonce, uri, this.cnonce, this.nc, response),
          },
        });
      }
      catch (e) {
        if (e.response.status !== 401 || this.count >= 10) return Promise.reject(e);

        const info = this.genDigestInfo(e.response.headers['WWW-Authenticate']);
        const HA1 = this.getHA1(username, password, realm);
        const HA2 = this.getHA2(uri);

        return this.loadAccount(
          username,
          info.realm,
          info.nonce,
          uri,
          this.cnonce,
          this.nc,
          this.getResponse(HA1, nonce, this.nc, this.cnonce, info.qop, HA2)
        );
      }

      this.count = 0;

      return res;
    },
    getToken() {

    },

    genDigestInfo(digestInfo) {
      const getQuery = this.getParams(digestInfo);

      return {
        realm : getQuery('realm'),
        nonce : getQuery('nonce'),
        qop   : getQuery('qop'),
      };
    },
    getParams(info) {
      const list = info.replace(new RegExp(/Digest /g), '')
        .replace(/"/g, '')
        .split(', ')
        .map((i) => i.split('='))
        .map((i) => ({ [i[0]]: i[1] }));

      const params = {};

      list.forEach((i) => { Object.assign(params, i); });

      return (query) => params[query];
    },
    getResponse(HA1, nonce, nc, cnonce, qop, HA2) {
      return md5(`${HA1}:${nonce}:${nc}:${cnonce}:${qop}:${HA2}`);
    },
    getHA2(uri) {
      return md5(`GET:${uri}`);
    },
    getHA1(username, password, realm) {
      return md5(`${username}:${realm}:${password}`);
    },
    createDigest(username, realm, nonce, uri, cnonce, nc, response) {
      return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", cnonce="${cnonce}", nc="${nc}", response="${response}, qop=auth"`;
    },
    updateCnonce() {
      this.timer = setInterval(() => {
        this.cnonce = uuid.v4().replace(/-/g, '');
      }, 5 * 60 * 1000);
    },

  },
  created() {
    this.updateCnonce();
  },
  computed : {
    uri() {
      return `${this.protocol}${this.address}${this.port}`;
    },
    nc() {
      const str = String(this.reqCount);

      return Array((8 - str.length))
        .fill(0)
        .map(() => 0)
        .join('') + str;
    },
  },
  watch : {

  },
});

export default model;
