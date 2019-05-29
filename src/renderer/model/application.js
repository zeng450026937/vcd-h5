import { remote, ipcRenderer, shell, screen } from 'electron';
import AutoLaunch from 'auto-launch';
import Vuem from './vuem';
import rtc from '../rtc';
import popup from '../popup';
import { $t } from '../i18n';

function dumpConnection() {
  const connection = navigator;

  return {
    downlink      : connection.downlink,
    downlinkMax   : connection.downlinkMax,
    effectiveType : connection.effectiveType,
    rtt           : connection.rtt,
    saveData      : connection.saveData,
    type          : connection.type,
  };
}

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
      onLine     : navigator.onLine,
      connection : dumpConnection(),
      remote,
      screen,
    };
  },

  computed : {
    offLine() {
      return !this.onLine;
    },
  },

  middleware : {
    async openExternal(ctx, next) {
      await next();

      shell.openExternal(ctx.payload.path);
    },
    async maximize(ctx, next) {
      await next();

      const { unBack } = ctx.payload;
      const current = remote.getCurrentWindow();

      if (current.isMaximized()) {
        if (!unBack) current.unmaximize();

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
    async show(ctx, next) {
      await next();

      remote.getCurrentWindow().show();
    },

    async updateTrayMenu(ctx, next) {
      await next();

      const { template } = ctx.payload;
      
      // send template via ipc message to main process
      ipcRenderer.send('update-tray-menu', template);
    },
    async openShareControls(ctx, next) {
      await next();

      const displays = screen.getAllDisplays();

      let currentPointX = screen.getCursorScreenPoint().x;

      let currentDistance = 0;

      displays.forEach((display) => {
        const { width } = display.bounds;

        currentPointX -= width;
        if (currentPointX > 0) currentDistance += width;
      });

      const width = 614;
      const height = 56;
      const offsetLeft = currentDistance + window.screen.width / 2 - width / 2;
      const offsetTop = 0;

      const option = `width=${width},height=${height},left=${offsetLeft},
            top=${offsetTop},directories=no,titlebar=no,
            toolbar=no,location=no,status=no,menubar=no,scrollbars=no`;

      return window.open('shareControls.html', 'share-controls', option);
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
      this.connection = dumpConnection();
    },
  },

  async created() {
    window.addEventListener('online', this.onLineChanged);
    window.addEventListener('offline', this.onLineChanged);
    navigator.connection.addEventListener('change', this.connectionChanged);

    ipcRenderer.on(
      'menu-event',
      (event, { name, menuItem }) => {
        console.warn('menu-event', name);
        // this.$dispatch('menu-event', name);

        if (name === 'language') {
          return this.$dispatch('i18n.setRendererLocale', { lang: menuItem.lang });
        }

        if (name === 'export-log') {
          return this.$dispatch('exportLog.downloadLogs');
        }

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

  // if hideWhenClose is enable, redirect close to hide
  if (method === 'close') {
    if (setting.hideWhenClose) {
      ctx.method = 'hide';
      
      return await next();
    }
    const showPopup = rtc.conference.connected || rtc.call.connected || rtc.call.connecting;

    if (showPopup) {
      const ensurePopup = popup.prepared('ensureModal',
        {
          content : $t('conversation.tip.closeWindowInConference'),
        });

      ensurePopup.display();
      ensurePopup.vm.$once('cancel', async() => popup.destroy(ensurePopup));
      ensurePopup.vm.$once('ok', async() => await next());
    }
    else {
      return await next();
    }
  }
  else {
    return await next();
  }
});

export default model;
