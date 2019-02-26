import { service } from '../axios';

const { post } = service;

export const uploadLog = (clientId, data) => post(`/softClientCheckApi/${clientId}/uploadLog`, data);

export const uploadConfig = (clientId, data) => post(`/softClientCheckApi/${clientId}/uploadConfig`, data);

export default {
  uploadLog,
  uploadConfig,
};
