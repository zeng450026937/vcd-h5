import { service } from '../axios';

const { post, put } = service;

export const clientUpdate = (clientId, data) => put(`softClients/${clientId}`, data);

export const clientHeart = (clientId) => post(`/softClients/${clientId}/heart`);


export default {
  clientHeart,
  clientUpdate,
};
