import Vuem from './vuem';
import { defer } from '../lib/defer';

const model = new Vuem();

model.provide({
  data() {
    return {
      lastSendTime : null,
      lastRecvTime : null,
    };
  },

  middleware : {
    async send(ctx, next) {
      await next();

      const { to, body } = ctx.payload;

      await this.send(to, body);
    },
  },

  methods : {
    async send(to, body) {
      if (!this.account) throw new Error('not ready');
      if (!this.account.registered) throw new Error('not available');
      if (!to) throw new Error('message target is required');
      if (!body) throw new Error('no message body is required');

      const d = defer(5000);

      const message = this.account.ua.sendMessage(to, body, {
        eventHandlers : {
          succeeded : () => d.resolve(message),
          failed    : (e) => d.reject(e),
        },
      });

      await d.promise;

      this.outgoing.push({
        direction      : message.direction,
        localIdentity  : message.local_identity,
        remoteIdentity : message.remote_identity,
        body           : message.body,
      });
      this.lastSendTime = Date.now();
    },
  },

  async created() {
    this.outgoing = [];
    this.outgoing._isVue = true;
    this.incoming = [];
    this.incoming._isVue = true;

    await this.$nextTick();

    const account = this.$getVM('account');

    account.$on('newMessage', (message) => {
      this.incoming.push({ 
        direction      : message.direction,
        localIdentity  : message.local_identity,
        remoteIdentity : message.remote_identity,
        body           : message.body,
      });
      this.lastRecvTime = Date.now();
    });

    this.account = account;
  },
});

export default model;
