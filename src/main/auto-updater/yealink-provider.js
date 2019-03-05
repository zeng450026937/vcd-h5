import semver, { SemVer } from 'semver';
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

  isVersionAvariable(info) {
    if (!info) return false;

    const {
      clientModel,
      clientPlatform,
      updateChannel,
      customId,
      clientVersion,
      forceUpdate,
    } = info;

    if (updateChannel !== this.channel) {
      console.warn(`Received update from other update channel. received: ${updateChannel} current: ${this.channel}`);
      
      return false;
    }

    if (clientModel !== process.env.VUE_APP_MODE
      || clientPlatform !== process.platform
      || customId !== process.env.VUE_APP_CUSTOMID) {
      console.warn('Received wrong update info.', JSON.stringify(info));

      return false;
    }

    const version = semver.parse(clientVersion);
    const currentVersion = semver.parse(this.currentVersion);

    const gt = semver.gt(version, currentVersion);

    if (gt) return true;
    
    if (forceUpdate) return true;

    return false;
  }
}
