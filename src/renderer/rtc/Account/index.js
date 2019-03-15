/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { UA, ConferenceManager, Call as Channel, Utils } from 'apollosip';
import { defer, setupEventHandlers, removeEventHandlers } from '../Utils';
import Schedule from '../Schedule';

export default Vue.extend({
  data() {
    return {
      // private
      ua            : null,
      cm            : null,
      // contactor     : null,
      smsId         : null,
      smsRetryAfter : 0,
      negotiateUrl  : '',
      // setting
      type          : '',
      username      : '8502',
      domain        : 'academia.com',
      password      : '123456',
      displayName   : 'VC Desktop',
      authName      : '',
      servers       : 'tls://10.200.112.165.xip.io:5061',
      protocol      : 'tls',
      // status
      status        : 'disconnected',
      error         : null,
      reason        : null,
      // info
      contacts      : null,
      schedule      : null,
      newMessage    : [],
      newChannel    : [],
    };
  },
  computed : {
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
    beeping() {
      return this.newMessage.length > 0;
    },
  },
  watch : {
    ua(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);
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
      // this.contactor.ua = val;
    },
    registered(val) {
      if (!this.d) return;
      /* eslint-disable no-unused-expressions */
      val ? this.d.resolve() : this.d.reject(this.error);
      this.d = null;
      this.schedule.subscribe();
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
        register    : true,
        debug       : true,
        client_info : 'Apollo_WebRTC',
        user_agent  : 'Yealink SIP-WEB',
      });

      ua._isVue = true;

      this.ua = ua;

      this.d = defer(5000);

      return this.d.promise;
    },
    signout() {
      this.ua = null;
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

      ua.start();
      ua.once('connected', () => new Promise((resolve, reject) => {
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

                resolve();
              },
              failed : (data) => {
                reject(data);
              },
            },
          }
        );
      }));
    },
    sendMessage(target, message) {
      if (!this.registered) return null;

      return this.ua.sendMessage(target, message);
    },
  },
  created() {
    this.$data.handlers = {
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

        const channel = new Channel(this.ua);

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
      negotiateUrlUpdated : (data) => {
        if (data) this.negotiateUrl = data;
      },
    };

    const cm = new ConferenceManager();

    cm._isVue = true;
    this.cm = cm;
    // this.cm.schedule.subscribe();
    // this.cm.schedule.on('notify', () => {
    //   this.schedules = this.cm.schedule.list;
    // });

    // 注册成功之后获取日程信息
    this.schedule = new Schedule({
      parent : this,
    });
    // const contactor = new Contactor();
    //
    // contactor._isVue = true;
    // this.contactor = contactor;
    // this.contactor.subscribe();
    // this.contactor.on('notify', () => {
    //   this.contacts = this.contactor.phonebook.tree;
    // });
  },
  destroyed() {
    // this.cm.schedule.unsubscribe();
    // this.cm.removeAllListeners();

    // this.contactor.unsubscribe();
    // this.contactor.removeAllListeners();

    if (this.ua) {
      this.ua.stop();
      this.ua.removeAllListeners();
      this.ua = null;
    }
  },
});
