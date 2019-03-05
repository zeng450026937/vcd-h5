import { Provider } from './provider';

export class YealinkProvider extends Provider {
  constructor(appUpdater, ytms) {
    super(appUpdater);
    
    this.ytms = ytms;
  }

  async getLatestVersion() {
    const clientId = await this.ytms.getClientId();
    const clientInfo = {
      clientId,
      clientModel    : process.env.VUE_APP_MODEL,
      clientType     : process.env.VUE_APP_TYPE,
      clientVersion  : this.appUpdater.appVersion,
      clientArch     : process.arch,
      clientPlatform : process.platform,
      customId       : process.env.VUE_APP_CUSTOMID,
      updateChannel  : this.channel,
    };

    // is it all right to use default api?
    const api = this.ytms.getApi();

    const res = await api.getUpdatePackage(clientInfo);

    if (!res) return;

    this.latestVersion = res;

    return res;
  }
}
