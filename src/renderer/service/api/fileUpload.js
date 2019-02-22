import { fileService as service } from '../axios';

const { post } = service;

export const uploadMultiFile = (clientId, data) => post(`/softClients/${clientId}/uploadFeedbackFile`, data);

export const uploadLog = (clientId, data) => post(`/softClients/${clientId}/uploadLog`, data);

export default {
  uploadMultiFile,
  uploadLog,
};
