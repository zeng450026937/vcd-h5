import SRV from '@/utils/srv';
import rtc from '../../rtc';

export default {
  data() {
    return {
      serverType      : 'yms',
      loginType       : 'login',
      forceServerMenu : false,
    };
  },
  methods : {
    async doLogin(ctx, next) {
      await next();
      const { payload } = ctx;

      let servers;

      const protocol = payload.protocol || 'tls';
      const defaultPort = protocol === 'wss' ? 443 : 5061;

      if (!payload.proxy) {
        try {
          const pre = protocol === 'wss' ? '_sips._wss.' : '_sips._tcp.';

          servers = await SRV.Resolve(pre + payload.server);
        }
        catch (error) {
          servers = await SRV.Lookup(payload.server);
        }
      }
      else {
        const [ address, port ] = payload.proxy.split(':');

        servers = [ { address, port } ];
      }

      const { account } = rtc;

      // 开始加载
      account.uri = `${payload.account}@${payload.server}`;
      account.password = payload.pin;
      account.servers = servers.map((s) => ({
        url    : `${protocol}://${s.address}:${s.port || defaultPort}${protocol === 'wss' ? '/meeting/join' : ''}`,
        weight : s.weight || s.priority,
      }));
      account.protocol = protocol;

      return account.signin();
    },
  },
};
