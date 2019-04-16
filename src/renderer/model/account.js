import Vuem from './vuem';
import storage, { LOGIN_STORAGE } from '../storage';
import rtc from '../rtc';
import { formatServers } from './utils';
import { IP_REG, DOMAIN_REG } from '../utils';

const model = new Vuem();

class AccountHistory {
  get() {}

  add() {}

  remove() {}

  update() {}
}

// ...
model.provide({
  data() {
    const serverType = storage.query(LOGIN_STORAGE.SERVER_TYPE) || 'cloud';
    const rmbPassword = storage.query(LOGIN_STORAGE.REMEMBER_PASSWORD);
    const autoLogin = storage.query(LOGIN_STORAGE.AUTO_LOGIN);
    const autoLoginDisabled = storage.query(LOGIN_STORAGE.AUTO_LOGIN_DISABLED);
    
    return {
      serverType,
      rmbPassword,
      autoLogin,
      autoLoginDisabled,
      loginType : 'login',
      proxy     : '',
      proxyPort : '',
    };
  },
  created() {
    this.history = new AccountHistory();
  },
  middleware : {
    async login(ctx, next) {
      await next();
      const { account, pin, server } = ctx.payload;

      this.validateForm(ctx.payload);

      const protocol = ctx.payload.protocol || 'tls';
      const port = this.proxyPort || (this.serverType === 'cloud' && protocol === 'tls' ? 5061 : 5061);

      rtc.account.uri = `${account}@${server}`;
      rtc.account.password = pin;
      rtc.account.servers = await formatServers({ server, protocol, proxy: this.proxy, port });
      rtc.account.protocol = protocol;
      await rtc.account.signin().then(() => {
        const loginData = Object.assign({}, { account, server }, {
          proxy         : this.proxy,
          proxyPort     : this.proxyPort,
          lastLoginDate : Date.now(),
          type          : this.serverType,
        });

        if (this.rmbPassword) {
          loginData.pin = pin;
        }
        this.loginData = loginData;
        storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'account');
        storage.update('CURRENT_ACCOUNT', loginData);
        this.storeConfig(); // 登录成功之后保存登录前的状态
      }).catch((err) => {
        throw err;
      });
    },
    async logout(ctx, next) {
      rtc.account.signout();
      await next();
    },
  },
  subscribe : {
  },
  methods : {
    storeConfig() {
      storage.insert(LOGIN_STORAGE.REMEMBER_PASSWORD, this.rmbPassword);
      storage.insert(LOGIN_STORAGE.AUTO_LOGIN, this.autoLogin);
    },
    validateForm(values) {
      let errorText = '';

      if (!values.account) errorText = 'ACCOUNT_NOT_EMPTY';
      else if (values.account.length > 128) errorText = 'ACCOUNT_TOO_LONG';
      else if (!values.pin) errorText = 'PASSWORD_NOT_EMPTY';
      else if (!values.pin.length > 128) errorText = 'PASSWORD_TOO_LONG';
      else if (!values.server) errorText = 'SERVER_NOT_EMPTY';
      else if (!IP_REG.test(values.server)
        && !DOMAIN_REG.test(values.server)) errorText = 'SERVER_FORMAT_ERROR';

      if (errorText) throw new Error(errorText);
    },
  },
  watch : {
    serverType(val) {
      storage.insert(LOGIN_STORAGE.SERVER_TYPE, val);
    },
    autoLoginDisabled(val) {
      storage.insert(LOGIN_STORAGE.AUTO_LOGIN_DISABLED, val);
    },
  },
});

// model.use(() => {});

export default model;
