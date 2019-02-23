import { service } from '../axios';

const { post, put } = service;

export const clientUpdate = (clientId, data) => put(`softClients/${clientId}`, data);

export const fullAmountUpdate = (clientId, data) => post('/softClients', data);

export const clientHeart = (clientId) => post(`/softClients/${clientId}/heart`);

export const checkRegister = (clientId) => post(`/softClients/${clientId}/checkRegister`);

export const pullLatestPackage = (clientId, data) => post(`/softClients/${clientId}/poll`, data);

export const reportAlarm = (clientId, data) => post(`/softClients/${clientId}/report`, data);


export default {
  clientHeart,
  clientUpdate,
  fullAmountUpdate,
  checkRegister,
  pullLatestPackage,
  reportAlarm,
};
