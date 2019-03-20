import Vuem from '../vuem';
import { UA, Utils, MediaChannel } from 'apollosip';
import { defer } from '@/renderer/lib/defer';
import { setupEventHandlers, removeEventHandlers } from '@/renderer/lib/event-handler';
import SRV from '@/shared/srv';

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

const MAX_MESSAGE_COUNT = 200;
const MAX_CHANNEL_COUNT = 10;

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
      newChannel   : [],
      newMessage   : [],
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

    server() {
      const hasOutbound = !!this.outbound;

      if (hasOutbound) {
        return `${this.protocol}://${this.outbound}:${this.outboundPort || this.defaultPort}`;
      }

      return `${this.protocol}://${this.domain}:${this.defaultPort}`;
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
    ua(val, oldVal) {
      removeEventHandlers(oldVal, this.handlers);
      setupEventHandlers(val, this.handlers);

      if (oldVal) {
        oldVal.stop();
        this.status = 'disconnected';
      }

      if (val) {
        this.status = val.isRegistered()
          ? 'registered'
          : val.isConnected()
            ? 'connected'
            : 'disconnected';
        val.start();
      }
      
      this.cm.ua = val;
    },

    registered(val) {
      if (!this.d) return;
      if (val) {
        this.d.resolve();
        this.d = null;
      }
    },

    unregistered(val) {
      if (!this.d) return;
      if (val) {
        this.d.reject(this.error);
        this.d = null;
      }
    },
  },

  methods : {
    signin() {
      const ua = new UA({
        uri           : this.uri,
        password      : this.password,
        servers       : this.servers,
        display_name  : this.displayName,
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

      ua._isVue = true;

      this.ua = ua;

      this.d = defer(5000);

      return this.d.promise;
    },

    signout() {
      if (this.ua) {
        this.ua.stop();
        this.ua.removeAllListeners();
        this.ua = null;
      }
    },

    sendVerificationCode() {
      const ua = new UA({
        uri      : this.uri,
        password : this.password,
        servers  : this.server,
        register : false,
        debug    : true,
      });

      ua._isVue = true;

      const d = defer(60000);

      ua.start();
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

                this.smsId = response.Result.code_uid;
                this.smsRetryAfter = response.Result.retry_interval;

                d.resolve();
              },
              failed : (data) => {
                d.reject(data);
              },
            },
          }
        );
      });

      return d.promise;
    },
  },

  created() {
    this.d = null;
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
        this.ua = null;
      },
      newMessage : (data) => {
        if (data.originator !== 'remote') return;

        this.newMessage.push(data.message);
      },
      newRTCSession : (data) => {
        if (data.originator !== 'remote') return;

        const channel = new MediaChannel(this.ua);

        channel._isVue = true;
        channel.session = data.session;
        this.newChannel.push(channel);

        const listeners = {
          finished : () => {
            const index = this.newChannel.indexOf(channel);

            this.newChannel.splice(index, 1);
            removeEventHandlers(channel, listeners);
          },
          failed : () => {
            const index = this.newChannel.indexOf(channel);

            this.newChannel.splice(index, 1);
            removeEventHandlers(channel, listeners);
          },
        };

        setupEventHandlers(channel, listeners);
      },
    };
  },

  beforeDestroy() {
    if (this.ua) {
      this.ua.stop();
      this.ua.removeAllListeners();
      this.ua = null;
    }
    this.handlers = null;
    this.d = null;
  },
});

export default model;
