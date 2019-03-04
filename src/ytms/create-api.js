import * as apis from './ytms-api';

export function YTMSAPI(baseURL, clientId) {
  this.baseURL = baseURL;
  this.clientId = clientId;
}

Object.keys(apis).forEach((api) => {
  YTMSAPI.prototype[api] = function(data) {
    return apis[api](this.baseURL, this.clientId, data);
  };
});

export function createApi(baseURL, clientId) {
  return new YTMSAPI(baseURL, clientId);
}
