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

export function MockAPI(reject = false) {
  this.reject = reject;
}

Object.keys(apis).forEach((api) => {
  MockAPI.prototype[api] = function() {
    return this.reject ? Promise.reject() : Promise.resolve();
  };
});

export function mockApi(reject) {
  return new MockAPI(reject);
}
