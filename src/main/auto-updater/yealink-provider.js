import axios from 'axios';
import { Provider } from './provider';

export class YealinkProvider extends Provider {
  constructor(appUpdater) {
    super(appUpdater);
    
    this.customId = 'default';
    this.clientModel = 'VCD-H5';
    this.clientType = 'software';
  }

  async getLatestVersion() {
    // const { platform, arch } = process;
    // const { brand, channel, feedURL } = this.appUpdater || {};

    // const res = await axios({
    //   url  : feedURL,
    //   data : {
    //     clientId : this.clientId,
    //     type     : this.clientType,
    //     platform,
    //     arch,
    //     brand,
    //     channel,
    //   },
    // });

    this.latestVersion = {
      file : {
        url : 'http://file.yealinkops.com/publish/enterprise/download/RTVC/vc-desktop-1.0.0-alpha.exe',
      },
    };

    return this.latestVersion;
  }
}
