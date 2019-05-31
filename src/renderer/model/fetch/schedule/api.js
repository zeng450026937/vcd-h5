
const CONFIG = {
  API  : 'http://10.200.112.137',
  PORT : '9999',
};

const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhcmVhIjoiQ05fMTEiLCJjb3VudHJ5IjoiQ04iLCJzIjowLCJleCI6MTU1OTEyNzAyMjcwNywidCI6InYiLCJwaWQiOiIzZTAyMmIyYjM4YTA0MDg0ODc5ZjBjZDg3MzQ3NTYyNSIsImlkIjoiNGI4MGU0Y2YzYmNlNGQ4NjkwYjJiZjE5N2EyYmIwNDIiLCJqdGkiOiJhOTcyZDEyY2M2NWE0NmFlOWRjNmJjZjdmYzhiNzU0OSJ9.MwQwQrTpVfG1DG60QohmrD9h02WTZuxiuASickxSTC_9BP7k6nT9F4CH_X5sMVLKPnUKE6rdYeAPrM0vLWPvFK9ix7SaXgErfWsF4pj6odTuIwdG5Z1YiGTrSOjmtzBrWFionNuofMEqd0u52rPfY4eChnm4z4INmGqVN-S27jI';

const BASE_URL = `${CONFIG.API}:${CONFIG.PORT}`;

// 获取当前登陆用户的日程列表
const GET_SCHEDULE_LIST = `${BASE_URL}/api/v10/external/conference/scheduled/calendar`;
// // 查询预约会议特例列表
const GET_EXCEPTION_LIST = `${BASE_URL}/api/v10/external/conference/scheduled/exception/list`;
// // 查询预约会议详情
const GET_SCHEDULE_INFO = `${BASE_URL}/api/v10/external/conference/scheduled/info`;
// // 删除日程
const DELETE_SCHEDULE = `${BASE_URL}/api/v10/external/conference/scheduled/delete`;

export default {
  CONFIG,
  TOKEN,
  BASE_URL,
  GET_SCHEDULE_LIST,
  GET_EXCEPTION_LIST,
  GET_SCHEDULE_INFO,
  DELETE_SCHEDULE,
};
