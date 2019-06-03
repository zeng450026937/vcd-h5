import Axios from 'axios';
import uuid from 'uuid';
import md5 from 'md5';
import Vuem from './vuem';
import rtc from '../rtc';


const model = new Vuem();


model.provide({
  data() {
    return {
      domain        : '10.200.112.137',
      protocol      : 'http://',
      port          : '9998',
      count         : 0,
      cnonce        : uuid.v4().replace(/-/g, ''),
      token         : null,
      accounts      : [],
      activeAccount : null,

    };
  },
  computed : {
    registered : () => rtc.account.registered,
    baseURL() {
      return `${this.protocol}${this.domain}:${this.port}`;
    },
    nc() {
      const str = String(this.count);

      return Array((8 - str.length))
        .fill(0)
        .map(() => 0)
        .join('') + str;
    },
  },
  middleware : {
    async loadAccount(ctx, next) {
      await next();

      const { username, password } = ctx.payload;

      return this.loadAccount(username, password);
    },
    async getToken(ctx, next) {
      await next();

      return this.selectAccount(ctx.payload.id);
    },
    async updateToken(ctx, next) {
      await next();
    },
  },
  methods : {
    async getToken(account, username, password, realm, nonce, response = '') {
      const uri = '/api/v10/external/digest/selectAccount';

      let res;

      try {
        res = await Axios({
          method  : 'post',
          baseURL : this.baseURL,
          url     : uri,
          data    : {
            partyId   : account.partyId,
            subjectId : account.subjectId,
          },
          headers : {
            Authorization : this.createDigest(username, realm, nonce, uri, this.cnonce, this.nc, response),
          },
        });
      }
      catch (e) {
        this.count++;

        if (e.response.status !== 401 || this.count > 10) {
          this.count = 0;

          return Promise.reject(e);
        }

        const info = this.genDigestInfo(e.response.headers['www-authenticate']);
        const HA1 = this.getHA1(username, password, info.realm);
        const HA2 = this.getHA2(uri);

        return this.getToken(
          account,
          username,
          password,
          info.realm,
          info.nonce,
          this.getResponse(HA1, info.nonce, this.nc, this.cnonce, info.qop, HA2)
        );
      }
      this.count = 0;

      if (res.data.ret < 0) return Promise.reject(res.data);

      this.token = res.data.data.token;

      return this.token;
    },
    async loadAccount(username, password, realm, nonce, response = '') {
      const uri = '/api/v10/external/digest/login';

      let res;

      try {
        res = await Axios({
          method  : 'post',
          baseURL : this.baseURL,
          url     : uri,
          headers : {
            Authorization : this.createDigest(username, realm, nonce, uri, this.cnonce, this.nc, response),
          },
        });
      }
      catch (error) {
        this.count++;

        if (error.response.status !== 401 || this.count >= 10) {
          if(this.count === 10) this.$message.error('账号或密码错误');
          this.count = 0;

          return Promise.reject(error);
        }

        const info = this.genDigestInfo(error.response.headers['www-authenticate']);
        const HA1 = this.getHA1(username, password, info.realm);
        const HA2 = this.getHA2(uri);

        return this.loadAccount(
          username,
          password,
          info.realm,
          info.nonce,
          this.getResponse(HA1, info.nonce, this.nc, this.cnonce, info.qop, HA2)
        );
      }

      this.count = 0;

      if (res.data.ret < 0) return Promise.reject(res.data);

      this.accounts = {
        username,
        password,
        accountInfos : res.data.data.accountInfos,
      };

      return res.data.data;
    },
    selectAccount(id) {
      const account = this.accounts.accountInfos.find((acc) => acc.accountInfo.id === id);

      this.activeAccount = {
        username  : this.accounts.username,
        password  : this.accounts.password,
        partyId   : account.partyInfo.id,
        subjectId : account.subjectInfo.id,
        accountId : account.accountInfo.id,
      };

      this.token = account.token;

      return {
        username : this.accounts.username,
        password : this.accounts.password,
        account  : this.activeAccount,
        token    : this.token,
      };
    },
    getQueryStr(name) {
      const reg = new RegExp(`${name}=([\\'"]?)(.*?)\\1`, 'i');

      return (info) => {
        const match = info.match(reg);

        if (match) return match[2];

        return null;
      };
    },
    genDigestInfo(digestInfo) {
      return {
        realm : this.getQueryStr('realm')(digestInfo),
        nonce : this.getQueryStr('nonce')(digestInfo),
        qop   : this.getQueryStr('qop')(digestInfo),
      };
    },
    getResponse(HA1, nonce, nc, cnonce, qop, HA2) {
      return md5(`${HA1}:${nonce}:${nc}:${cnonce}:${qop}:${HA2}`);
    },
    getHA2(uri) {
      return md5(`POST:${uri}`);
    },
    getHA1(username, password, realm) {
      return md5(`${username}:${realm}:${password}`);
    },
    createDigest(username, realm, nonce, uri, cnonce, nc, response) {
      return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", cnonce="${cnonce}", nc="${nc}", response="${response}", qop="auth"`;
    },
    updateCnonce() {
      this.timer = setInterval(() => {
        this.cnonce = uuid.v4().replace(/-/g, '');
      }, 5 * 60 * 1000);
    },
    updateToken() {
      this.timer = setInterval(() => {
        this.$dispatch('digest.getToken', { id: this.activeAccount.accountId });
      }, 30 * 60 * 1000);
    },
    reset() {
      clearInterval(this.timer);
      this.token = null;
      this.accounts = [];
      this.activeAccount = null;
    },

  },
  created() {
    this.updateCnonce();
  },
  beforeDestroy() {
    this.reset();
  },
  watch : {
    registered(val) {
      if (val) return this.updateToken();

      this.reset();
    },
  },
});

export default model;
