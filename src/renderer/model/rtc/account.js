import { UA, Utils } from 'apollosip';
import Vuem from '../vuem';
import { defer } from '../../lib/defer';
import { setupEventHandlers, removeEventHandlers } from '../../lib/event-handler';
import { resolveSipDomain } from '../../lib/resolve-sip-domain';

const SIP_PROTOCOL = {
  WSS : 'wss',
  TLS : 'tls',
  UDP : 'udp',
};

const ACCOUNT_TYPE = {};

ACCOUNT_TYPE[ACCOUNT_TYPE.YMS = 0] = 'YMS';
ACCOUNT_TYPE[ACCOUNT_TYPE.CLOUD = 1] = 'CLOUD';

const SIP_PORT = {
  [ACCOUNT_TYPE.YMS] : {
    [SIP_PROTOCOL.WSS] : 5061,
    [SIP_PROTOCOL.TLS] : 5061,
    [SIP_PROTOCOL.UDP] : 5061,
  },
  [ACCOUNT_TYPE.CLOUD] : {
    [SIP_PROTOCOL.WSS] : 7443,
    [SIP_PROTOCOL.TLS] : 5061,
    [SIP_PROTOCOL.UDP] : 5061,
  },
};

export { SIP_PROTOCOL, ACCOUNT_TYPE, SIP_PORT };

const model = new Vuem();

model.provide({
  data() {
    return {
      // private
      ua           : null,
      // public
      type         : ACCOUNT_TYPE.YMS,
      username     : '',
      domain       : '',
      password     : '',
      displayName  : 'VC Desktop',
      authName     : '',
      outbound     : '',
      outboundPort : '',
      protocol     : SIP_PROTOCOL.WSS,
      // readonly
      status       : 'disconnected',
      error        : null,
      reason       : null,
    };
  },

  computed : {
    defaultPort() {
      return SIP_PORT[this.type] && SIP_PORT[this.type][this.protocol];
    },

    uri : {
      get() {
        return `${this.username}@${this.domain}`;
      },
      set(val = '') {
        const [ username = '', domain = '' ] = val.split('@', 2);

        this.username = username;
        this.domain = domain;
      },
    },

    connecting() {
      return this.status === 'connecting';
    },

    connected() {
      return this.status === 'connected'
        || this.status === 'registering'
        || this.status === 'registered';
    },

    disconnected() {
      return this.status === 'disconnected';
    },

    registering() {
      return this.status === 'registering';
    },

    registered() {
      return this.status === 'registered';
    },

    unregistered() {
      return this.status === 'unregistered'
        || this.status === 'registrationFailed'
        || this.status === 'disconnected';
    },

    registrationFailed() {
      return this.status === 'registrationFailed';
    },
  },

  watch : {
    ua(val) {
      if (!val) this.status = 'disconnected';

      if (val) {
        setupEventHandlers(val, this.handlers);
        this.status = val.isRegistered()
          ? 'registered'
          : val.isConnected()
            ? 'connected'
            : 'disconnected';
        val.start();
      }
    },
  },

  middleware : {
    async signin(ctx, next) {
      await next();

      const {
        username = '',
        password = '',
        domain = 'yealinkvc.com',
        outbound = '',
        outboundPort = '',
        displayName = '',
      } = ctx.payload;

      this.username = username;
      this.password = password;
      this.domain = domain;
      this.outbound = outbound;
      this.outboundPort = outboundPort;
      this.displayName = displayName;

      await this.signin();
    },

    async signout(ctx, next) {
      await next();

      this.signout();
    },
  },

  methods : {
    async signin() {
      let servers;

      if (!this.outbound) {
        servers = await resolveSipDomain(this.domain);
      }
      else {
        const [ address, port = this.outboundPort ] = this.outbound.split(':');

        servers = [ { address, port } ];
      }

      servers = servers.map((s) => ({
        url    : `${this.protocol}://${s.address}:${s.port || this.defaultPort}`,
        weight : s.weight || s.priority,
      }));

      const ua = new UA({
        uri           : this.uri,
        password      : this.password,
        servers,
        display_name  : this.displayName || this.username,
        socketOptions : {
          type               : this.protocol,
          mode               : 'direct',
          rejectUnauthorized : false,
        },
        register             : true,
        debug                : true,
        client_info          : 'Apollo_WebRTC',
        user_agent           : 'Yealink SIP-WEB',
        DtlsSrtpKeyAgreement : false,
        rtcpMuxPolicy        : 'negotiate',
      });

      ua._isVue = true; // prevent to be observed

      this.signinDefer = defer(5000);

      const listeners = {
        registered : () => {
          this.signinDefer.resolve();
          removeEventHandlers(ua, listeners);
        },
        registrationFailed : (e) => {
          this.signinDefer.reject(e);
          removeEventHandlers(ua, listeners);
          this.signout();
        },
      };

      setupEventHandlers(ua, listeners);

      this.ua = ua; // start ua

      await this.signinDefer.promise;
    },

    signout() {
      if (this.ua) {
        this.ua.removeAllListeners();
        this.ua.stop();
        this.ua = null;
      }
    },

    async sendVerificationCode() {
      let ua = new UA({
        uri      : this.uri,
        password : this.password,
        servers  : this.server,
        register : false,
        debug    : true,
      });

      const d = defer(5000, null, () => {
        ua.removeAllListeners();
        ua.stop();
        ua = null;
      });

      ua.once('connected', () => {
        ua.sendService(
          'anoymous@anoymous.com', // target is not required
          'apollo-get-sms', // event
          '',
          {
            contentType   : 'application/account-auth+xml',
            eventHandlers : {
              succeeded : (data) => {
                const response = Utils.objectify(data.response.body);

                const smsId = response.Result.code_uid;
                const smsRetryAfter = response.Result.retry_interval;

                d.resolve({ smsId, smsRetryAfter });
              },
              failed : (data) => {
                d.reject(data);
              },
            },
          }
        );
      });

      ua.start();

      const ret = await d.promise;

      return ret;
    },
  },

  created() {
    this.signinPromise = null;
    this.handlers = null;

    this.handlers = {
      connecting : () => {
        this.status = 'connecting';
      },
      connected : () => {
        this.status = 'connected';
        this.status = 'registering';
      },
      disconnected : () => {
        this.status = 'disconnected';
      },
      registered : () => {
        this.status = 'registered';
      },
      unregistered : () => {
        this.status = 'unregistered';
      },
      registrationFailed : (data) => {
        this.status = 'registrationFailed';
        this.error = data;
        this.signout();
      },
      newMessage : (data) => {
        if (data.originator === 'local') return;

        this.$emit('newMessage', data.message);
      },
      newRTCSession : (data) => {
        if (data.originator === 'local') return;

        this.$emit('newRTCSession', data.session);
      },
      bookConferenceUpdated : (data) => {
        this.$emit('bookConferenceUpdated', data);
      },
      phonebookUpdated : (data) => {
        this.$emit('phonebookUpdated', data);
      },
      negotiateUrlUpdated : (data) => {
        this.$emit('negotiateUrlUpdated', data);
      },
    };
  },

  beforeDestroy() {
    this.signout();

    this.handlers = null;
    this.d = null;
  },
});

export default model;
