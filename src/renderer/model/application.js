import Vuem from './vuem';
import { remote } from 'electron';

const model = new Vuem();

model.provide({
  data() {
    return {
      title    : process.env.VUE_APP_TITLE,
      model    : process.env.VUE_APP_MODEL,
      category : process.env.VUE_APP_CATEGORY,
      customId : process.env.VUE_APP_CUSTOMID,
    };
  },

  middleware : {
    async maximize(ctx, next) {
      const current = remote.getCurrentWindow();

      if (current.isMaximized()) {
        current.unmaximize();

        return;
      }

      current.maximize();
    },
    async minimize(ctx, next) {
      remote.getCurrentWindow().minimize();
    },
    async close(ctx, next) {
      remote.getCurrentWindow().close();
    },
  },
  
  methods : {
    isMaximized() {
      return remote.getCurrentWindow().isMaximized();
    },
  },
});

export default model;
