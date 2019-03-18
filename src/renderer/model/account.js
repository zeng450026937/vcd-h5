import Vuem from './vuem';
import storage, { LOGIN_STORAGE } from '../storage';
import rtc from '../rtc';
import SRV from '../../shared/srv';

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
    
    return {
      serverType,
      rmbPassword,
      autoLogin,
      autoLoginDisabled : false,
      loginType         : 'login',
      proxy             : '',
      proxyPort         : '',
    };
  },
  created() {
    this.history = new AccountHistory();
  },
  middleware : {
    async login(ctx, next) {
      const { account, pin, server } = ctx.payload;

      const protocol = ctx.payload.protocol || 'wss';
      const defaultPort = this.serverType === 'cloud' && protocol === 'wss' ? 7443 : 5061;

      let servers;

      if (!this.proxy) {
        try {
          const pre = protocol === 'wss' ? '_sips._wss.' : '_sips._tcp.';

          servers = await SRV.Resolve(pre + server);
        }
        catch (error) {
          servers = await SRV.Lookup(server);
        }
      }
      else {
        const [ address, port ] = this.proxy.split(':');

        servers = [ { address, port: port || this.proxyPort } ];
      }

      rtc.account.uri = `${account}@${server}`;
      rtc.account.password = pin;
      rtc.account.servers = servers.map((s) => ({
        url    : `${protocol}://${s.address}:${s.port || defaultPort}`,
        weight : s.weight || s.priority,
      }));
      rtc.account.protocol = protocol;
      rtc.account.signin().then(() => {
        const loginData = Object.assign({}, { account, server }, {
          proxy         : this.proxy,
          proxyPort     : this.proxyPort,
          lastLoginDate : Date.now(),
          type          : this.serverType,
        });

        if (this.rmbPassword) {
          loginData.pin = pin;
        }
        storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'account');
        storage.update('CURRENT_ACCOUNT', loginData);
        this.storeConfig(); // 登录成功之后保存登录前的状态
      }).then((err) => console.warn(err));
      await next();
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
      storage.insert(LOGIN_STORAGE.SERVER_TYPE, this.serverType);
      storage.insert(LOGIN_STORAGE.REMEMBER_PASSWORD, this.rmbPassword);
      storage.insert(LOGIN_STORAGE.AUTO_LOGIN, this.autoLogin);
    },
  },
});

// model.use(() => {});

export default model;
