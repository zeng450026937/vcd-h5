import Vuem from './vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      lastSendTime : null,
      lastRecvTime : null,
    };
  },

  middlseware : {
    // p2p
    async connect(ctx, next) {
      await next();
    },

    async ipcall(ctx, next) {
      await next();
    },

    // conference
    // & anonymouse dialin
    async dialin(ctx, next) {
      await next();
    },

    async answer(ctx, next) {
      await next();
    },
  },

  async created() {
    this.outgoing = [];
    this.outgoing._isVue = true;
    this.incoming = [];
    this.incoming._isVue = true;

    await this.$nextTick();

    const account = this.$getVM('account');

    account.$on('newRTCSession', (session) => {
      /*
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
      */
      this.lastRecvTime = Date.now();
    });

    this.account = account;
  },
});

export default model;
