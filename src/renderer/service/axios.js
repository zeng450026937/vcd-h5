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

export const ylFileService = axios.create({
  baseURL : YEALINK_URL,
  timeout : 1000 * 60 * 30,
  headers : {
    'Content-Type' : 'multipart/form-data',
  },
});

export default {
  service,
  fileService,
  ylService,
};
