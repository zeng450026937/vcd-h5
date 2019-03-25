import { remote, ipcRenderer } from 'electron';
import AutoLaunch from 'auto-launch';
import Vuem from './vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      name       : remote.app.getName(),
      version    : remote.app.getVersion(),
      title      : process.env.VUE_APP_TITLE,
      model      : process.env.VUE_APP_MODEL,
      category   : process.env.VUE_APP_CATEGORY,
      customId   : process.env.VUE_APP_CUSTOMID,
      //
      onLine     : false,
      connection : null,
    };
  },

  computed : {
    offLine() {
      return !this.onLine;
    },
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

    async updateTrayMenu(ctx, next) {
      await next();

      const { template } = ctx.payload;
      
      // send template via ipc message to main process
      ipcRenderer.send('update-tray-menu', template);
    },
  },
  
  methods : {
    isMaximized() {
      return remote.getCurrentWindow().isMaximized();
    },

    onLineChanged() {
      this.onLine = navigator.onLine;
    },

    connectionChanged() {
      const connection = navigator;

      this.connection = {
        downlink      : connection.downlink,
        downlinkMax   : connection.downlinkMax,
        effectiveType : connection.effectiveType,
        rtt           : connection.rtt,
        saveData      : connection.saveData,
        type          : connection.type,
      };
    },
  },

  async created() {
    window.addEventListener('online', this.onLineChanged);
    window.addEventListener('offline', this.onLineChanged);
    navigator.connection.addEventListener('change', this.connectionChanged);

    ipcRenderer.on(
      'menu-event',
      (event, { name }) => {
        console.warn('menu-event', name);
        this.$dispatch('menu-event', name);
      }
    );

    this.autoLauncher = new AutoLaunch({
      name : remote.app.getName(),
      // path is not required for electron app
    });

    // model hasn't be fully initilized when created() invoked
    await this.$nextTick();
    // model fully initilized

    const setting = this.$getVM('setting');

    setting.$watch(
      'autoStart',
      (val) => {
        if (val) this.autoLauncher.enable();
        else this.autoLauncher.disable();
      }
    );

    setting.autoStart = await this.autoLauncher.isEnabled();
  },

  beforeDestroy() {
    window.removeEventListener('online', this.onLineChanged);
    window.removeEventListener('offline', this.onLineChanged);
    navigator.connection.removeEventListener('change', this.connectionChanged);
  },
});

model.use(async(ctx, next) => {
  const { method, setting } = ctx;
  const hideWhenClose = setting.hideWhenClose;

  // if hideWhenClose is enable, redirect close to hide
  if (method === 'close' && hideWhenClose) {
    ctx.method = 'hide';
  }

  await next();
});

export default model;
