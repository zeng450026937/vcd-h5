import axios from 'axios';

const inst = axios.create();

const __DEV__ = process.env.NODE_ENV === 'development';
const __RENDERER__ = process.type === 'renderer';

const inspectRequest = false;
const inspectResponse = __DEV__;

if (inspectRequest) {
  inst.interceptors.request.use(
    (config) => {      
      console.log(`YTMS API: ${config.method.toUpperCase()} ${config.url} ${config.baseURL}`);
      console.log('YTMS API DATA: \n', config.data || '');

      return config;
    },
    (error) => {
      console.warn(`${error}`);

      return Promise.reject(error);
    }
  );
}
if (inspectResponse) {
  inst.interceptors.response.use(
    (response) => {
      const { status, config, data } = response;
      
      console.log(`YTMS API: ${status} ${config.method.toUpperCase()} ${config.url}`);
      
      if (data.error) {
        console.error(data.error);
      }

      return response;
    },
    (error) => {
      console.warn(`${error}`);

      return Promise.reject(error);
    }
  );
}

export function throwIfError(res) {
  const { data } = res;

  if (data.error || data.ret === -1) {
    throw new Error(JSON.stringify(data.error || data));
  }
}

export async function doFeedback(baseURL, clientId, formdata) {
  const res = await inst({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/feedbacks`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  throwIfError(res);

  return res.data.data;
}

export async function getEnterpriseInfo(baseURL, clientId, data) {
  const res = await inst({
    method : 'get',
    baseURL,
    url    : '/system/enterpriseInfo',
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function getUpdatePackage(baseURL, clientId, data) {
  const res = await inst({
    method : 'post',
    baseURL,
    url    : '/packages/pollLatest',
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function resetClientInfo(baseURL, clientId, data) {
  const res = await inst({
    method : 'post',
    baseURL,
    url    : '/clients',
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function updateClientInfo(baseURL, clientId, data) {
  const res = await inst({
    method : 'put',
    baseURL,
    url    : `/clients/${clientId}`,
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function getClientStatus(baseURL, clientId, data) {
  const res = await inst({
    method : 'get',
    baseURL,
    url    : `/clients/${clientId}/status`,
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function heartbeat(baseURL, clientId, expire = 300) {
  const res = await inst({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/heart?expire=${expire}`,
  });

  throwIfError(res);

  return res.data.data;
}

export async function doAlarm(baseURL, clientId, formdata) {
  const res = await inst({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/alarms`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  throwIfError(res);

  return res.data.data;
}

export async function uploadConfig(baseURL, clientId, data) {
  const res = await inst({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/configs`,
    data,
  });

  throwIfError(res);

  return res.data.data;
}

export async function uploadLogs(baseURL, clientId, formdata) {
  const res = await inst({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/logs`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  throwIfError(res);

  return res.data.data;
}

export async function uploadNetLogs(baseURL, clientId, formdata) {
  const res = await inst({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/packets`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  throwIfError(res);

  return res.data.data;
}

export async function reportSessionState(baseURL, clientId, sessionId, data, expire = 30) {
  if (expire > 30) expire = 30;

  const res = await inst({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/sessions/${sessionId}/progress?expire=${expire}`,
    data,
  });
  
  throwIfError(res);

  return res.data.data;
}

// 新增API必须保证前两个参数必须是 baseURL, clientId 不管有用没用
