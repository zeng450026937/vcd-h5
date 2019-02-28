import { fileService as service } from '../axios';

const { post } = service;

export const uploadMultiFile = (clientId, data, config) => post(`/softClients/${clientId}/uploadFeedbackFile`, data, config);

export const uploadLog = (clientId, data, config) => post(`/softClients/${clientId}/logs`, data, config);

export default {
  uploadMultiFile,
  uploadLog,
};
