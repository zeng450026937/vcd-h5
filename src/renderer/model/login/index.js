import Vuem from '../vuem';
import rtc from '../../rtc';
import sketch from './sketch';
import state from './state';
import _account, { PROTOCOL, PORT } from './account';
import { DOMAIN_REG, IP_REG } from '../../utils';
import { formatServers } from '../utils';

const model = new Vuem();

model.mount('sketch', sketch);
model.mount('state', state);
model.mount('account', _account);

model.provide({
  middleware : {
    async login(ctx, next) {
      await next();
      const { loginData, proxy, proxyPort } = this.account;

      if (this.sketch.isYMS) {
        loginData.account = loginData.principle;
      }

      this.validateForm({ ...loginData });
      const protocol = loginData.protocol || PROTOCOL.DEFAULT;

      const port = proxyPort || (this.sketch.isCloud && protocol === PROTOCOL.WSS ? PORT.CLOUD_WSS : PORT.DEFAULT);

      rtc.account.uri = `${loginData.account}@${loginData.server}`;
      rtc.account.password = loginData.pin;
      rtc.account.authorizationUser = loginData.principle;
      rtc.account.servers = await formatServers({
        server : loginData.server,
        protocol,
        proxy,
        port,
      });
      rtc.account.protocol = protocol;

      this.account.autoLoginDisabled = true;
      await rtc.account.signin().then(() => {
        this.account.saveData();
        this.account.autoLoginDisabled = false;
      }).catch((err) => {
        this.account.autoLoginDisabled = true;
        throw err;
      });
    },
    async logout(ctx, next) {
      await next();
      this.account.autoLoginDisabled = true;

      return rtc.account.signout();
    },
  },
  async created() {
    await this.$nextTick();
  },
  methods : {
    validateForm(values) {
      let errorText = '';

      const { account, server, pin } = values;

      switch (true) {
        case !account: errorText = 'ACCOUNT_NOT_EMPTY'; break;
        case account.length > 128: errorText = 'ACCOUNT_TOO_LONG'; break;
        case !pin: errorText = 'PASSWORD_NOT_EMPTY'; break;
        case pin.length > 128: errorText = 'PASSWORD_TOO_LONG'; break;
        case !server: errorText = 'SERVER_NOT_EMPTY'; break;
        case !IP_REG.test(server)
        && !DOMAIN_REG.test(server): errorText = 'SERVER_FORMAT_ERROR'; break;
        default: break;
      }
      if (errorText) throw new Error(errorText);
    },
  },
});

export default model;
