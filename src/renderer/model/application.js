import { remote } from 'electron';
import Vuem from './vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      name     : remote.app.getName(),
      version  : remote.app.getVersion(),
      title    : process.env.VUE_APP_TITLE,
      model    : process.env.VUE_APP_MODEL,
      category : process.env.VUE_APP_CATEGORY,
      customId : process.env.VUE_APP_CUSTOMID,
    };
  },

  middleware : {
    async maximize(ctx, next) {
      await next();

      const current = remote.getCurrentWindow();

      if (current.isMaximized()) {
        current.unmaximize();

        return;
      }

      current.maximize();
    },
    async minimize(ctx, next) {
      await next();

      remote.getCurrentWindow().minimize();
    },
    async close(ctx, next) {
      await next();

      remote.getCurrentWindow().close();
    },
    async hide(ctx, next) {
      await next();

      remote.getCurrentWindow().hide();
    },
  },
  
  methods : {
    isMaximized() {
      return remote.getCurrentWindow().isMaximized();
    },
  },
});

model.use(async(ctx, next) => {
  const { method, setting } = ctx;
  const hideWhenClose = setting.common.forceMinimize;

  // if hideWhenClose is enable, redirect close to hide
  if (method === 'close' && hideWhenClose) {
    ctx.method = 'hide';
  }

  await next();
});

export default model;
