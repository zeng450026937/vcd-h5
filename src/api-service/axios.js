import axios from 'axios';

const ENTERPRISE_URL = 'http://10.5.200.199:8082';
const YEALINK_URL = 'http://10.5.200.199:8083';

export const service = axios.create({
  baseURL : ENTERPRISE_URL,
  timeout : 1000 * 60 * 30,
  headers : {
    'Content-Type' : 'application/json;charset=UTF-8',
  },
});

export const fileService = axios.create({
  baseURL : ENTERPRISE_URL,
  headers : {
    'Content-Type' : 'multipart/form-data',
  },
});

export const ylService = axios.create({
  baseURL : YEALINK_URL,
  timeout : 1000 * 60 * 30,
  headers : {
    'Content-Type' : 'application/json;charset=UTF-8',
  },
});

const success = (response) => {
  console.log('[receive resoponse]:', response.data);

  return response;
};

const fail = (error) => {
  console.log(error);

  return Promise.reject(error);
};

const reqSuc = (config) => {
  console.log('[send request]:', config.data);

  return config;
};

const reqErr = (error) => {
  console.log(error);

  return Promise.reject(error);
};

service.interceptors.response.use(success, fail);
fileService.interceptors.response.use(success, fail);
ylService.interceptors.response.use(success, fail);

service.interceptors.request.use(reqSuc, reqErr);
fileService.interceptors.request.use(reqSuc, reqErr);
ylService.interceptors.request.use(reqSuc, reqErr);


export default {
  service,
  fileService,
  ylService,
};
