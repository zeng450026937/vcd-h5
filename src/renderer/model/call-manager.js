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
      this.lastRecvTime = Date.now();
    });

    this.account = account;
  },
});

export default model;
