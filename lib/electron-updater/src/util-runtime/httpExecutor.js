import { createHash } from 'crypto';
import { createWriteStream } from 'fs-extra';
import { Transform } from 'stream';
import { URL } from 'url';
import { CancellationToken } from './CancellationToken';
import { newError } from './index';
import { ProgressCallbackTransform } from './ProgressCallbackTransform';

const HTTP_STATUS_CODES = new Map([
  [ 429, 'Too many requests' ],
  [ 400, 'Bad request' ],
  [ 403, 'Forbidden' ],
  [ 404, 'Not found' ],
  [ 405, 'Method not allowed' ],
  [ 406, 'Not acceptable' ],
  [ 408, 'Request timeout' ],
  [ 413, 'Request entity too large' ],
  [ 500, 'Internal server error' ],
  [ 502, 'Bad gateway' ],
  [ 503, 'Service unavailable' ],
  [ 504, 'Gateway timeout' ],
  [ 505, 'HTTP version not supported' ],
]);

export class HttpError extends Error {
  constructor(statusCode, message = `HTTP error: ${HTTP_STATUS_CODES.get(statusCode) || statusCode}`, description = null) {
    super(message);

    this.statusCode = statusCode;
    this.description = description;
    this.name = 'HttpError';
  }
}

export function createHttpError(response, description = null) {
  return new HttpError(response.statusCode || -1, `${response.statusCode} ${response.statusMessage}${description == null ? '' : (`\n${JSON.stringify(description, null, '  ')}`)}\nHeaders: ${safeStringifyJson(response.headers)}`, description);
}

export function parseJson(result) {
  return result.then(it => (it == null || it.length === 0 ? null : JSON.parse(it)));
}

export class HttpExecutor {
  constructor() {
    this.maxRedirects = 10;
  }

  request(options, cancellationToken = new CancellationToken(), data) {
    configureRequestOptions(options);
    const encodedData = data == null ? undefined : Buffer.from(JSON.stringify(data));

    if (encodedData != null) {
      options.method = 'post';
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = encodedData.length;
    }
    
    return this.doApiRequest(options, cancellationToken, it => {
      it.end(encodedData);
    });
  }

  doApiRequest(options, cancellationToken, requestProcessor, redirectCount = 0) {
    return cancellationToken.createPromise((resolve, reject, onCancel) => {
      const request = this.createRequest(options, response => {
        try {
          this.handleResponse(response, options, cancellationToken, resolve, reject, redirectCount, requestProcessor);
        }
        catch (e) {
          reject(e);
        }
      });

      this.addErrorAndTimeoutHandlers(request, reject);
      this.addRedirectHandlers(request, options, reject, redirectCount, options => {
        this.doApiRequest(options, cancellationToken, requestProcessor, redirectCount)
          .then(resolve)
          .catch(reject);
      });
      requestProcessor(request, reject);
      onCancel(() => request.abort());
    });
  }

  
  addRedirectHandlers(request, options, reject, redirectCount, handler) {
    // not required for NodeJS
  }

  addErrorAndTimeoutHandlers(request, reject) {
    this.addTimeOutHandler(request, reject);
    request.on('error', reject);
    request.on('aborted', () => {
      reject(new Error('Request has been aborted by the server'));
    });
  }

  handleResponse(response,
    options,
    cancellationToken,
    resolve,
    reject,
    redirectCount,
    requestProcessor) {
    // we handle any other >= 400 error on request end (read detailed message in the response body)
    if (response.statusCode === 404) {
      // error is clear, we don't need to read detailed error description
      reject(createHttpError(response, `method: ${options.method} url: ${options.protocol || 'https:'}//${options.hostname}${options.path}

Please double check that your authentication token is correct. Due to security reasons actual status maybe not reported, but 404.
`));
      
      return;
    }
    else if (response.statusCode === 204) {
      // on DELETE request
      resolve();
      
      return;
    }

    const redirectUrl = safeGetHeader(response, 'location');

    if (redirectUrl != null) {
      if (redirectCount > this.maxRedirects) {
        reject(this.createMaxRedirectError());
        
        return;
      }

      this.doApiRequest(
        HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options), cancellationToken, requestProcessor, redirectCount
      )
        .then(resolve)
        .catch(reject);
      
      return;
    }

    response.setEncoding('utf8');

    let data = '';

    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        if (response.statusCode != null && response.statusCode >= 400) {
          const contentType = safeGetHeader(response, 'content-type');
          const isJson = contentType != null && (Array.isArray(contentType) ? contentType.find(it => it.includes('json')) != null : contentType.includes('json'));

          reject(createHttpError(response, isJson ? JSON.parse(data) : data));
        }
        else {
          resolve(data.length === 0 ? null : data);
        }
      }
      catch (e) {
        reject(e);
      }
    });
  }

  async downloadToBuffer(url, options) {
    return await options.cancellationToken.createPromise((resolve, reject, onCancel) => {
      let result = null;
      const requestOptions = {
        headers  : options.headers || undefined,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic,
        // so, we need to redirect manually
        redirect : 'manual',
      };

      configureRequestUrl(url, requestOptions);
      configureRequestOptions(requestOptions);
      this.doDownload(requestOptions, {
        destination : null,
        options,
        onCancel,
        callback    : error => {
          if (error == null) {
            resolve(result);
          }
          else {
            reject(error);
          }
        },
        responseHandler : (response, callback) => {
          const contentLength = safeGetHeader(response, 'content-length');

          let position = -1;

          if (contentLength != null) {
            const size = parseInt(contentLength, 10);

            if (size > 0) {
              if (size > 5242880) {
                callback(new Error('Maximum allowed size is 5 MB'));
                
                return;
              }

              result = Buffer.alloc(size);
              position = 0;
            }
          }
          response.on('data', chunk => {
            if (position !== -1) {
              chunk.copy(result, position);
              position += chunk.length;
            }
            else if (result == null) {
              result = chunk;
            }
            else {
              if (result.length > 5242880) {
                callback(new Error('Maximum allowed size is 5 MB'));
                
                return;
              }
              result = Buffer.concat([ result, chunk ]);
            }
          });
          response.on('end', () => {
            if (result != null && position !== -1 && position !== result.length) {
              callback(new Error(`Received data length ${position} is not equal to expected ${result.length}`));
            }
            else {
              callback(null);
            }
          });
        },
      }, 0);
    });
  }

  doDownload(requestOptions, options, redirectCount) {
    const request = this.createRequest(requestOptions, response => {
      if (response.statusCode >= 400) {
        options.callback(new Error(`Cannot download "${requestOptions.protocol || 'https:'}//${requestOptions.hostname}${requestOptions.path}", status ${response.statusCode}: ${response.statusMessage}`));
        
        return;
      }

      // this code not relevant for Electron (redirect event instead handled)
      const redirectUrl = safeGetHeader(response, 'location');

      if (redirectUrl != null) {
        if (redirectCount < this.maxRedirects) {
          this.doDownload(
            HttpExecutor.prepareRedirectUrlOptions(redirectUrl, requestOptions), options, redirectCount++
          );
        }
        else {
          options.callback(this.createMaxRedirectError());
        }
        
        return;
      }

      if (options.responseHandler == null) {
        configurePipes(options, response);
      }
      else {
        options.responseHandler(response, options.callback);
      }
    });

    this.addErrorAndTimeoutHandlers(request, options.callback);
    this.addRedirectHandlers(request, requestOptions, options.callback, redirectCount, requestOptions => {
      this.doDownload(requestOptions, options, redirectCount++);
    });
    request.end();
  }

  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }

  addTimeOutHandler(request, callback) {
    request.on('socket', socket => {
      socket.setTimeout(60 * 1000, () => {
        request.abort();
        callback(new Error('Request timed out'));
      });
    });
  }

  static prepareRedirectUrlOptions(redirectUrl, options) {
    const newOptions = configureRequestOptionsFromUrl(redirectUrl, { ...options });
    const headers = newOptions.headers;

    if (headers != null && headers.authorization != null && headers.authorization.startsWith('token')) {
      const parsedNewUrl = new URL(redirectUrl);

      if (parsedNewUrl.hostname.endsWith('.amazonaws.com')) {
        delete headers.authorization;
      }
    }
    
    return newOptions;
  }
}

export function configureRequestOptionsFromUrl(url, options) {
  const result = configureRequestOptions(options);

  configureRequestUrl(new URL(url), result);
  
  return result;
}

export function configureRequestUrl(url, options) {
  options.protocol = url.protocol;
  options.hostname = url.hostname;
  if (url.port) {
    options.port = url.port;
  }
  else if (options.port) {
    delete options.port;
  }
  options.path = url.pathname + url.search;
}

export class DigestTransform extends Transform {
  get actual() {
    return this._actual;
  }

  constructor(expected, algorithm = 'sha512', encoding = 'base64') {
    super();

    this.expected = expected;
    this.algorithm = algorithm;
    this.encoding = encoding;
    this._actual = null;
    this.isValidateOnEnd = true;
    this.digester = createHash(algorithm);
  }

  // noinspection JSUnusedGlobalSymbols
  _transform(chunk, encoding, callback) {
    this.digester.update(chunk);
    callback(null, chunk);
  }

  // noinspection JSUnusedGlobalSymbols
  _flush(callback) {
    this._actual = this.digester.digest(this.encoding);

    if (this.isValidateOnEnd) {
      try {
        this.validate();
      }
      catch (e) {
        callback(e);
        
        return;
      }
    }

    callback(null);
  }

  validate() {
    if (this._actual == null) {
      throw newError('Not finished yet', 'ERR_STREAM_NOT_FINISHED');
    }

    if (this._actual !== this.expected) {
      throw newError(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, 'ERR_CHECKSUM_MISMATCH');
    }

    return null;
  }
}

function checkSha2(sha2Header, sha2, callback) {
  if (sha2Header != null && sha2 != null && sha2Header !== sha2) {
    callback(new Error(`checksum mismatch: expected ${sha2} but got ${sha2Header} (X-Checksum-Sha2 header)`));
    
    return false;
  }
  
  return true;
}

export function safeGetHeader(response, headerKey) {
  const value = response.headers[headerKey];

  if (value == null) {
    return null;
  }
  else if (Array.isArray(value)) {
    // electron API
    return value.length === 0 ? null : value[value.length - 1];
  }
  else {
    return value;
  }
}

function configurePipes(options, response) {
  if (!checkSha2(safeGetHeader(response, 'X-Checksum-Sha2'), options.options.sha2, options.callback)) {
    return;
  }

  const streams = [];

  if (options.options.onProgress != null) {
    const contentLength = safeGetHeader(response, 'content-length');

    if (contentLength != null) {
      streams.push(
        new ProgressCallbackTransform(
          parseInt(contentLength, 10), options.options.cancellationToken, options.options.onProgress
        )
      );
    }
  }

  const sha512 = options.options.sha512;

  if (sha512 != null) {
    streams.push(new DigestTransform(sha512, 'sha512', sha512.length === 128 && !sha512.includes('+') && !sha512.includes('Z') && !sha512.includes('=') ? 'hex' : 'base64'));
  }
  else if (options.options.sha2 != null) {
    streams.push(new DigestTransform(options.options.sha2, 'sha256', 'hex'));
  }

  const fileOut = createWriteStream(options.destination);

  streams.push(fileOut);

  let lastStream = response;

  streams.forEach(stream => {
    stream.on('error', error => {
      if (!options.options.cancellationToken.cancelled) {
        options.callback(error);
      }
    });
    lastStream = lastStream.pipe(stream);
  });

  fileOut.on('finish', () => {
    fileOut.close(options.callback);
  });
}

export function configureRequestOptions(options, token, method) {
  if (method != null) {
    options.method = method;
  }

  let headers = options.headers;

  if (headers == null) {
    headers = {};
    options.headers = headers;
  }
  if (token != null) {
    (headers).authorization = token.startsWith('Basic') ? token : `token ${token}`;
  }
  if (headers['User-Agent'] == null) {
    headers['User-Agent'] = 'Yealink';
  }

  if ((method == null || method === 'GET') || headers['Cache-Control'] == null) {
    headers['Cache-Control'] = 'no-cache';
  }

  // do not specify for node (in any case we use https module)
  if (options.protocol == null && (process.versions).electron != null) {
    options.protocol = 'https:';
  }
  
  return options;
}

export function safeStringifyJson(data, skippedNames) {
  return JSON.stringify(data, (name, value) => {
    if (name.endsWith('authorization') || name.endsWith('Password') || name.endsWith('PASSWORD') || name.endsWith('Token') || name.includes('password') || name.includes('token') || (skippedNames != null && skippedNames.has(name))) {
      return '<stripped sensitive data>';
    }
    
    return value;
  }, 2);
}
