import axios from 'axios';

const service = axios.create({
  baseURL : 'http://10.5.200.199:8082',
  timeout : 1000 * 60 * 30,
  headers : {
    'Content-Type' : 'application/json;charset=UTF-8',
  },
});

export default service;
