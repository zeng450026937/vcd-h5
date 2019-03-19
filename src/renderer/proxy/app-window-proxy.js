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
    
    let url;

    // get url from setting
    url = 'http://10.5.200.199:8083';
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
          // TODO: update ytms address to model
    
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
