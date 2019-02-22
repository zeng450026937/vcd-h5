import axios from 'axios';

export const service = axios.create({
  baseURL : 'http://10.5.200.199:8083',
  timeout : 1000 * 60 * 30,
  headers : {
    'Content-Type' : 'application/json;charset=UTF-8',
  },
});

export const fileService = axios.create({
  baseURL : 'http://10.5.200.199:8083',
  headers : {
    'Content-Type' : 'multipart/form-data',
  },
});

export default {
  service,
  fileService,
};
