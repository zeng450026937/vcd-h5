import Vuem from 'vuem';
import { remote } from 'electron';

const model = new Vuem();

model.provide({
  computed : {
    setting() {
      return this.$parent.setting;
    },
  },
  middleware : {
    async maximize(ctx, next) {
      console.warn(ctx);

      const current = remote.getCurrentWindow();

      if (current.isMaximized()) {
        current.unmaximize();

        return;
      }

      current.maximize();
    },
    async minimize(ctx, next) {
      console.warn(ctx);

      remote.getCurrentWindow().minimize();
    },
    async close(ctx, next) {
      console.warn(ctx);

      // remote.getCurrentWindow().hide();
    },
  },
  methods : {
    isMaximized() {
      return remote.getCurrentWindow().isMaximized();
    },
  },
});

model.use(async(ctx, next) => {
  const { method, ns } = ctx;

  console.log(ctx.isMatch());

  if (method === 'close') {
    ctx.hideWhenClose = true;
  }

  await next();
});

export default model;
