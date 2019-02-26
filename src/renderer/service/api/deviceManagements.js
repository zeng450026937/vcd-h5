import { service, ylService } from '../axios';

function genService(server) {
  const { post, put } = server;

  const clientUpdate = (clientId, data) => put(`softClients/${clientId}`, data);

  const fullAmountUpdate = (data) => post('/softClients', data);

  const clientHeart = (clientId) => post(`/softClients/${clientId}/heart`);

  const checkRegister = (clientId) => post(`/softClients/${clientId}/checkRegister`);

  const pullLatestPackage = (clientId, data) => post(`/softClients/${clientId}/poll`, data);

  const reportAlarm = (clientId, data) => post(`/softClients/${clientId}/report`, data);

  return {
    clientHeart,
    clientUpdate,
    fullAmountUpdate,
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
