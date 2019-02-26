import { service } from '../axios';

const { get } = service;

export const getEnterpriseInfo = () => get('/system/enterpriseInfo');

export default {
  getEnterpriseInfo,
};
