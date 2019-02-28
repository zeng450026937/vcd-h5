import axios from 'axios';

const __RENDERER__ = process.type === 'renderer';

export async function doFeedback(baseURL, clientId, formdata) {
  const res = await axios({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/feedbacks`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  return res.data;
}

export async function getEnterpriseInfo(baseURL, clientId, data) {
  const res = await axios({
    method : 'get',
    baseURL,
    url    : '/system/enterpriseInfo',
    data,
  });

  return res.data;
}

export async function getUpdatePackage(baseURL, clientId, data) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : '/packages/pollLatest',
    data,
  });

  return res.data;
}

export async function resetClientInfo(baseURL, clientId, data) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : '/clients',
    data,
  });

  return res.data;
}

export async function updateClientInfo(baseURL, clientId, data) {
  const res = await axios({
    method : 'put',
    baseURL,
    url    : `/clients/${clientId}`,
    data,
  });

  return res.data;
}

export async function getClientStatus(baseURL, clientId) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/status`,
  });

  return res.data;
}

export async function heartBeat(baseURL, clientId, expire = 300) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/heart?expire=${expire}`,
  });

  return res.data;
}

export async function doAlarm(baseURL, clientId, formdata) {
  const res = await axios({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/alarms`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  return res.data;
}

export async function uploadConfig(baseURL, clientId, data) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/configs`,
    data,
  });

  return res.data;
}

export async function uploadLogs(baseURL, clientId, formdata) {
  const res = await axios({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/logs`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  return res.data;
}

export async function uploadNetLogs(baseURL, clientId, formdata) {
  const res = await axios({
    method  : 'post',
    baseURL,
    url     : `/clients/${clientId}/packets`,
    headers : __RENDERER__ ? null : formdata.getHeaders(),
    data    : formdata,
  });

  return res.data;
}

export async function reportNetLogs(baseURL, clientId, sessionId, data, expire = 300) {
  const res = await axios({
    method : 'post',
    baseURL,
    url    : `/clients/${clientId}/sessions/${sessionId}/progress?expire=${expire}`,
    data,
  });

  return res.data;
}
