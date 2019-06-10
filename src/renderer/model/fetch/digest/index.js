import Axios from 'axios';
import uuid from 'uuid';
import { genDigest, genHa1, genHa2, genResponse } from './utils';
import Vuem from '../../vuem';
import rtc from '../../../rtc';
import API from './api';
import auth from '../auth';

const model = new Vuem();


model.provide({
  data() {
    return {
      appId         : 'vcs',
      count         : 0,
      cNonce        : '',
      token         : null,
      accounts      : [],
      activeAccount : null,
    };
  },
  computed : {
    baseUrl() {
      const { pushUrl } = this.$getVM('login.account');

      if (!pushUrl) return API.BASE_URL;
      
      return pushUrl.startsWith('http://') ? pushUrl : `http://${pushUrl}`;
    },
    registered : () => rtc.account.registered,
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
      const uri = API.SELECT_ACCOUNT;

      let res;

      try {
        res = await Axios({
          method  : 'post',
          baseURL : this.baseUrl,
          url     : API.SELECT_ACCOUNT,
          data    : {
            partyId   : account.partyId,
            subjectId : account.subjectId,
          },
          headers : {
            'Y-Authorization' : auth({
              appId  : this.appId,
              method : 'GET',
              path   : uri,
            }),
            Authorization : genDigest({
              uri,
              realm,
              nonce,
              username,
              response,
              cNonce : this.cNonce,
              nc     : this.nc,
            }),
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
        const HA1 = genHa1({
          username, password, realm : info.realm,
        });
        const HA2 = genHa2({ uri });

        return this.getToken(
          account,
          username,
          password,
          info.realm,
          info.nonce,
          genResponse({
            ha1    : HA1,
            ha2    : HA2,
            nc     : this.nc,
            cNonce : this.cNonce,
            qop    : info.qop,
            nonce  : info.nonce,
          })
        );
      }
      this.count = 0;

      if (res.data.ret < 0) return Promise.reject(res.data);

      this.token = res.data.data.token;

      return this.token;
    },
    async loadAccount(username, password, realm, nonce, response = '') {
      const uri = API.LOGIN;

      let res;

      try {
        res = await Axios({
          method  : 'post',
          baseURL : this.baseUrl,
          url     : uri,
          headers : {
            'Y-Authorization' : auth({
              appId  : this.appId,
              method : 'GET',
              path   : uri,
            }),
            Authorization : genDigest({
              uri,
              realm,
              nonce,
              username,
              response,
              cNonce : this.cNonce,
              nc     : this.nc,
            }),
          },
        });
      }
      catch (error) {
        this.count++;

        if (error.response.status !== 401 || this.count >= 10) {
          if (this.count === 10) this.$message.error('账号或密码错误');
          this.count = 0;

          return Promise.reject(error);
        }

        const info = this.genDigestInfo(error.response.headers['www-authenticate']);
        const HA1 = genHa1({ username, password, realm: info.realm });
        const HA2 = genHa2({ uri });

        return this.loadAccount(
          username,
          password,
          info.realm,
          info.nonce,
          genResponse({
            ha1    : HA1,
            ha2    : HA2,
            nc     : this.nc,
            cNonce : this.cNonce,
            qop    : info.qop,
            nonce  : info.nonce,
          })
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
    updateCNonce() {
      const genCNonce = () => {
        this.cNonce = uuid.v4().replace(/-/g, '');
      };

      genCNonce();
      this.timer = setInterval(genCNonce, 5 * 60 * 1000);
    },
    updateToken() {
      this.timer = setInterval(() => {
        this.$dispatch('digest.getToken', { id: this.activeAccount.accountId });
      }, 30 * 60 * 1000);
    },
    reset() {
      clearInterval(this.timer);
      // this.token = null;
      this.accounts = [];
      this.activeAccount = null;
    },

  },
  created() {
    this.updateCNonce();
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
