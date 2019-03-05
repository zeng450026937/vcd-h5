import * as apis from './ytms-api';

export function YTMSAPI(baseURL, clientId) {
  this.baseURL = baseURL;
  this.clientId = clientId;
}

Object.keys(apis).forEach((api) => {
  YTMSAPI.prototype[api] = function(...args) {
    return apis[api](this.baseURL, this.clientId, ...args);
  };
});

export function createApi(baseURL, clientId) {
  return new YTMSAPI(baseURL, clientId);
}
