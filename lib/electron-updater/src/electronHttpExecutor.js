import { net, session } from 'electron';
import { HttpExecutor, configureRequestOptions, configureRequestUrl } from './util-runtime/httpExecutor';

export const NET_SESSION_NAME = 'electron-updater';

export function getNetSession() {
  return session.fromPartition(NET_SESSION_NAME, {
    cache : false,
  });
}

export class ElectronHttpExecutor extends HttpExecutor {
  constructor(proxyLoginCallback) {
    super();
    this.proxyLoginCallback = proxyLoginCallback;
    this.cachedSession = null;
  }

  async download(url, destination, options) {
    return await options.cancellationToken.createPromise((resolve, reject, onCancel) => {
      const requestOptions = {
        headers  : options.headers || undefined,
        redirect : 'manual',
      };

      configureRequestUrl(url, requestOptions);
      configureRequestOptions(requestOptions);
      this.doDownload(requestOptions, {
        destination,
        options,
        onCancel,
        callback : error => {
          if (error == null) {
            resolve(destination);
          }
          else {
            reject(error);
          }
        },
        responseHandler : null,
      }, 0);
    });
  }

  createRequest(options, callback) {
    // differential downloader can call this method very often, so, better to cache session
    if (this.cachedSession == null) {
      this.cachedSession = getNetSession();
    }

    const request = net.request({
      ...options,
      session : this.cachedSession,
    });

    request.on('response', callback);
    if (this.proxyLoginCallback != null) {
      request.on('login', this.proxyLoginCallback);
    }
    
    return request;
  }

  addRedirectHandlers(request, options, reject, redirectCount, handler) {
    request.on('redirect', (statusCode, method, redirectUrl) => {
      // no way to modify request options, abort old and make a new one
      // https://github.com/electron/electron/issues/11505
      request.abort();

      if (redirectCount > this.maxRedirects) {
        reject(this.createMaxRedirectError());
      }
      else {
        handler(HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options));
      }
    });
  }
}
