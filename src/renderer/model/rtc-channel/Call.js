import Vuem from '../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      call : null, // mediaChannel shareChannel
    };
  },
  middleware : {
    async connect(ctx, next) {
      await next();
      const { options, isAnonymous } = ctx.payload;
      
      return this.call.connect(options, isAnonymous);
    },
    async answer(ctx, next) {
      await next();
    },
    async decline(ctx, next) {
      await next();
    },
    async upgrade(ctx, next) {
      await next();
    },
    async sendDTMF(ctx, next) {
      await next();
    },
  },
  async create() {
    await this.$nextTick();

    const callManager = this.$getVM('callManager');

    callManager.$watch('currentChannel', (val) => {
      this.channel = val;
    });
  },
});

export default model;
