import { ipcRenderer } from 'electron';
import { createApi } from '../../ytms/create-api';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },

  async created() {
    ipcRenderer.on(
      'menu-event',
      (event, { name }) => {
        console.warn('menu-event', name);
      }
    );
    
    await this.$nextTick();
    
    let url;

    // get url from setting
    url = this.$model.setting.ytmsHostAddress;
    url = url || process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;
    
    if (url) {
      const clientId = await ipcProxy.startYTMSService(url).catch((e) => console.warn(e));    

      this.$api = window.api = createApi(url, clientId);
    }

    ipcRenderer.on(
      'system-config',
      async(event, { config }) => {    
        const {
          pushUpdateChannelFlag,
          pushYtmsHostFlag,
          updateChannel,
          ytmsHostAddress,
        } = config;
    
        if (pushUpdateChannelFlag && updateChannel) {
          this.$model.setting.common.updateChannel = updateChannel;
        }
    
        if (pushYtmsHostFlag && ytmsHostAddress) {
          this.$model.setting.ytmsHostAddress = ytmsHostAddress;
    
          const clientId = await ipcProxy.startYTMSService(ytmsHostAddress);
    
          this.$api = window.api = createApi(ytmsHostAddress, clientId);
        }
      }
    );
  },

  async mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);
  },
};
