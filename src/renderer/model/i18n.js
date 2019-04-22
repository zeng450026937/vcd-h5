import Vuem from './vuem';
import i18n from '../i18n';

const model = new Vuem();


model.provide({
  data() {
    return {

    };
  },
  middleware : {
    async changeLocale(ctx, next) {
      await next();
      i18n.locale = ctx.payload.lang;
    },
  },
});


export default model;
