import axios from 'axios';
import { randomBytes } from 'crypto';
import { Provider } from './provider';

export class YealinkProvider extends Provider {
  constructor(appUpdater) {
    super(appUpdater);
    this.clientId = randomBytes(32).toString();
    this.clientType = 'VCD';
  }

  setClientId(id) {
    this.clientId = id;
  }

  async getLatestVersion() {
    const { platform, arch } = process;
    const { brand, channel, feedURL } = this.appUpdater || {};

    const res = await axios({
      url  : feedURL,
      data : {
        clientId : this.clientId,
        type     : this.clientType,
        platform,
        arch,
        brand,
        channel,
      },
    });

    return this.latestVersion = res.data;
  }
}
