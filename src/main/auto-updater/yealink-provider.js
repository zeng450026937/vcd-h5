import semver from 'semver';
import { Provider } from './provider';

export class YealinkProvider extends Provider {
  constructor(appUpdater, service) {
    super(appUpdater);
    
    this.service = service;
  }

  setService(service) {
    this.service = service;
  }

  async getLatestVersion() {
    const clientId = await this.service.getClientId();
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
    const api = this.service.api;

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

    if (clientModel !== process.env.VUE_APP_MODEL
      || clientPlatform !== process.platform
      || customId !== process.env.VUE_APP_CUSTOMID) {
      console.warn('Received wrong update info.', JSON.stringify(info));

      return false;
    }

    const version = semver.parse(clientVersion);
    const currentVersion = semver.parse(this.currentVersion);

    const gt = semver.gt(version, currentVersion);

    if (gt) return true;

    const eq = semver.eq(version, currentVersion);
    
    // TODO: check releaseDate
    if (forceUpdate && !eq) return true;

    return false;
  }
}
