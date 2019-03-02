import { ylFileService } from '../axios';

const { post } = ylFileService;

export const feedBackReport = (clientId, data, config) => post(`/clients/${clientId}/feedbacks`, data, config);

export default {
  feedBackReport,
};
