import { fileService as service } from '../axios';

const { post } = service;

export const uploadMultiFile = (clientId, data, config) => post(`/clients/${clientId}/uploadFeedbackFile`, data, config);

export const uploadLog = (clientId, data, config) => post(`/clients/${clientId}/logs`, data, config);

export default {
  uploadMultiFile,
  uploadLog,
};
