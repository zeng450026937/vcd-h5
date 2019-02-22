import { service } from '../axios';

const { post } = service;

export const feedBackReport = (clientId, data) => post(`/softClients/${clientId}/feedback`, data);

export default {
  feedBackReport,
};
