import semver from 'semver';
import { Provider } from './provider';

function normalizePlatform(platform) {
  return platform === 'win32' 
    ? 'windows' 
    : platform === 'darwin'
      ? 'mac' : platform;
}

export class YealinkProvider extends Provider {
  constructor(appUpdater, service) {
    super(appUpdater);
    
    this.service = service;
  }

  get forceUpdate() {
    return this.latestVersion && this.latestVersion.forceUpdate;
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
      clientPlatform : normalizePlatform(process.platform),
      customId       : process.env.VUE_APP_CUSTOMID,
      updateChannel  : this.channel,
    };

    const api = this.service.api;

    if (!api) return;

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

    if (!clientVersion) return false;

    if (updateChannel !== this.channel) {
      logger.warn(`received update from other update channel. received: ${updateChannel} current: ${this.channel}`);
      
      return false;
    }

    if (clientModel !== process.env.VUE_APP_MODEL
      || clientPlatform !== normalizePlatform(process.platform)
      || customId !== process.env.VUE_APP_CUSTOMID) {
      logger.warn('received wrong update info');

      return false;
    }

    const { allowDowngrade } = this.appUpdater;

    const version = semver.parse(clientVersion);
    const currentVersion = semver.parse(this.currentVersion);

    const gt = semver.gt(version, currentVersion);
    const eq = semver.eq(version, currentVersion);
    const lt = semver.lt(version, currentVersion);

    if (gt) return true;

    // TODO: check releaseDate
    // if (eq && forceUpdate) return true;

    if (lt && allowDowngrade) return true;

    return false;
  }
}
