import { HttpError } from '../util-runtime/httpExecutor';
import { newError, getChannelFilename, newBaseUrl, newUrlFromBase } from '../util-runtime';
import { parseUpdateInfo, resolveFiles, Provider } from './Provider';

export class YealinkProvider extends Provider {
  constructor(configuration, updater, runtimeOptions) {
    super(runtimeOptions);
    
    this.configuration = configuration;
    this.updater = updater;
    this.baseUrl = newBaseUrl(this.configuration.url);
  }

  get channel() {
    return this.updater.channel || this.configuration.channel || 'stable';
  }

  async getLatestVersion() {
    const channelFile = getChannelFilename(this.channel);
    const channelUrl = newUrlFromBase(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);

    for (let attemptNumber = 0; ; attemptNumber++) {
      try {
        return parseUpdateInfo(await this.httpRequest(channelUrl), channelFile, channelUrl);
      }
      catch (e) {
        if (e instanceof HttpError && e.statusCode === 404) {
          throw newError(`Cannot find channel "${channelFile}" update info: ${e.stack || e.message}`, 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND');
        }
        else if (e.code === 'ECONNREFUSED') {
          if (attemptNumber < 3) {
            await new Promise((resolve, reject) => {
              try {
                setTimeout(resolve, 1000 * attemptNumber);
              }
              catch (e) {
                reject(e);
              }
            });
            continue;
          }
        }
        throw e;
      }
    }
  }

  resolveFiles(updateInfo) {
    return resolveFiles(updateInfo, this.baseUrl);
  }
}
