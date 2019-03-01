import * as apis from './ytms-api';

export function YTMPAPI(baseURL, clientId) {
  this.baseURL = baseURL;
  this.clientId = clientId;
}

Object.keys(apis).forEach((api) => {
  YTMPAPI.prototype[api] = function(data) {
    return apis[api](this.baseURL, this.clientId, data);
  };
});

export function createApi(baseURL, clientId) {
  return new YTMPAPI(baseURL, clientId);
}
