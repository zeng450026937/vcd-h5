import { ipcRenderer } from 'electron';
import { createApi } from '../../ytms/create-api';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  async mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);

    const clientId = await ipcProxy.getClientId();

    const apis = {};

    window.apis = apis;
    this.$apis = apis;

    let url = process.env.VUE_APP_YTMS_URL;

    apis.yealink = createApi(url, clientId);
    
    url = this.$model.setting.normal.address;

    if (url) {
      await ipcProxy.startYTMSService(url);

      apis.enterprise = createApi(url, clientId);
    }
  },
};
