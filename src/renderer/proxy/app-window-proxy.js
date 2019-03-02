import { ipcRenderer } from 'electron';
import { startYTMSService, getClientId } from './main-process-proxy';
import { createApi } from '../../ytms/create-api';

let startTime = 0;

export const AppWindowProxy = {
  beforeCreate() {
    startTime = performance.now();
  },
  async mounted() {
    ipcRenderer.send('renderer-ready', performance.now() - startTime);

    const clientId = await getClientId();

    const apis = {};

    window.apis = apis;
    this.$apis = apis;

    let url = process.env.VUE_APP_YTMS_URL;

    apis.yealink = createApi(url, clientId);
    
    // TODO: get ytms url setted by user
    url = this.$storage.query('YTMS_URL');

    if (url) {
      await startYTMSService(url);

      apis.enterprise = createApi(url, clientId);
    }
  },
};
