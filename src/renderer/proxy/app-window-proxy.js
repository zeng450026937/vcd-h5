import { ipcRenderer } from 'electron';
import { createApi } from '../../ytms/create-api';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  async mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);
    
    ipcRenderer.on(
      'menu-event',
      (event, { name }) => {
        console.warn('menu-event', name);
      }
    );
    
    const clientId = await ipcProxy.getClientId();
    const apis = window.apis = {};
    
    this.$apis = apis;
    
    let url = process.env.YEALINK_YTMS_URL || process.env.VUE_APP_YTMS_URL;
    
    apis.yealink = createApi(url, clientId);
    
    url = 'http://10.200.112.147:9302';
    
    if (url) {
      await ipcProxy.startYTMSService(url);
    
      apis.enterprise = createApi(url, clientId);
    }
    
    ipcRenderer.on(
      'system-config',
      async(event, { config }) => {
        console.warn(config);
    
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
          this.$model.setting.common.address = ytmsHostAddress;
    
          await ipcProxy.startYTMSService(ytmsHostAddress);
    
          apis.enterprise = createApi(ytmsHostAddress, clientId);
        }
    
        this.$model.setting.common.save();
      }
    );
  },
};
