import service from '../axios';

const { post } = service;

export const clientChange = (data) => post('/softClient/change', data);

export default {
  clientChange,
};
