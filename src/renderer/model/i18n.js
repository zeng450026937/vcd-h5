import Vuem from './vuem';

const model = new Vuem();


model.provide({
  data() {
    return {
      language : 'zh',
    };
  },
  middleware : {
    async changeLocale(ctx, next) {
      await next();
      this.language = ctx.payload.lang;
    },
  },
});


export default model;
