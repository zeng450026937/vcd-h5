import { service, ylService } from '../axios';

function genService(server) {
  const { post, put } = server;

  const clientUpdate = (clientId, data) => put(`/clients/${clientId}`, data);

  const resetClient = (data) => post('/clients', data);

  const clientHeart = (clientId) => post(`/clients/${clientId}/heart`);

  const checkRegister = (clientId) => post(`/clients/${clientId}/checkRegister`);

  const pullLatestPackage = (clientId, data) => post(`/clients/${clientId}/poll`, data);

  const reportAlarm = (clientId, data, config = {}) => post(`/clients/${clientId}/alarms`, data, config);

  return {
    clientHeart,
    clientUpdate,
    resetClient,
    checkRegister,
    pullLatestPackage,
    reportAlarm,
  };
}

export const deviceManagement = genService(service);
export const ylDeviceManagement = genService(ylService);

export default {
  deviceManagement,
  ylDeviceManagement,
};
