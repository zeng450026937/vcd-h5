import SRV from '@/utils/srv';
import rtc from '../../rtc';
import storage from '../../storage';
import { LOGIN_STORAGE } from '../../storage/constants';

export default {
  data() {
    const serverType = storage.query(LOGIN_STORAGE.SERVER_TYPE) || 'cloud';
    const rememberPassword = storage.query(LOGIN_STORAGE.REMEMBER_PASSWORD);
    const autoLogin = storage.query(LOGIN_STORAGE.AUTO_LOGIN);

    return {
      serverType,
      rememberPassword,
      autoLogin,
      autoLoginDisabled : false,
      loginType         : 'login',
      proxy             : '10.200.112.165',
      proxyPort         : 5061,
    };
  },
  mounted() {
  },
  methods : {
    async doLogin(ctx, next) {
      await next();
      const { account, pin, server } = ctx.payload;

      const protocol = ctx.payload.protocol || 'tls';
      const defaultPort = this.proxyPort || 5061;

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

        servers = [ { address, port } ];
      }

      rtc.account.uri = `${account}@${server}`;
      rtc.account.password = pin;
      rtc.account.servers = servers.map((s) => ({
        url    : `${protocol}://${s.address}:${s.port || defaultPort}`,
        weight : s.weight || s.priority,
      }));
      rtc.account.protocol = protocol;

      return rtc.account.signin().then(() => {
        const loginData = Object.assign({}, { account, server }, {
          proxy         : this.proxy,
          proxyPort     : defaultPort,
          lastLoginDate : Date.now(),
          type          : this.serverType,
        });

        if (this.rememberPassword) {
          loginData.pin = pin;
        }
        storage.insertOrUpdate('ACCOUNT_LIST', loginData, 'account');
        this.storeConfig(); // 登录成功之后保存登录前的状态
      });
    },
    storeConfig() {
      storage.insert(LOGIN_STORAGE.SERVER_TYPE, this.serverType);
      storage.insert(LOGIN_STORAGE.REMEMBER_PASSWORD, this.rememberPassword);
      storage.insert(LOGIN_STORAGE.AUTO_LOGIN, this.autoLogin);
    },
  },
};
