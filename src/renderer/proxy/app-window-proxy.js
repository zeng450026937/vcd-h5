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
    
    url = this.$model.setting.normal.address;

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
          this.$model.setting.normal.updateChannel = updateChannel;
        }

        if (pushYtmsHostFlag && ytmsHostAddress) {
          this.$model.setting.normal.address = ytmsHostAddress;

          await ipcProxy.startYTMSService(ytmsHostAddress);
    
          apis.enterprise = createApi(ytmsHostAddress, clientId);
        }
        
        this.$model.setting.normal.save();
      }
    );
  },
};
