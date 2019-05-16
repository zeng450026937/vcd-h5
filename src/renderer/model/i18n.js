import Vuem from './vuem';
import { $t } from '../i18n';
import { setLocale } from '../proxy/main-process-proxy';
import { langList } from '../i18n/config';

const model = new Vuem();

model.provide({
  data() {
    return {
      t        : $t,
      language : 'zh',
      langList : Object.keys(langList).map((key) => (
        {
          label : langList[key].remark,
          lang  : langList[key].locale,
        }
      )),
    };
  },
  middleware : {
    async setRendererLocale(ctx, next) {
      await next();
      this.language = ctx.payload.lang;
    },
    async setMainLocale(ctx, next) {
      await next();
      const lang = ctx.payload.lang;

      return setLocale(lang);
    },
  },
});


export default model;
