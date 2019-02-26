import { deviceManagement, ylDeviceManagement } from './api/deviceManagements';
import { getEnterpriseInfo } from './api/enterprise';


const states = {
  START_UP    : 0,
  USER_LOGIN  : 1,
  USER_LOGOUT : 2,
};

export default class ClientManagement {
  constructor(systemInfo) {
    this.accountInfo = {};
    this.systemInfo = systemInfo;
    getEnterpriseInfo().then((info) => {
      const { data:{ data:enterpriseInfo } } = info;

      this.enterpriseInfo = enterpriseInfo || {};
    });
  }

  set state(state) {
    switch (state) {
      case states.START_UP:
        this.updateClientInfo(this.systemInfo);
        break;

      case states.USER_LOGIN:
        this.genClentInfo().then((info) => {
          this.updateClientInfo(info);
          this.startHeartBeat(info);
        });
        break;

      case states.USER_LOGOUT:
        this.stopHeartBeat();
        break;

      default:
        break;
    }
  }

  async genClentInfo() {
    return Promise.resolve(Object.assign(
      this.systemInfo,
      {
        account     : this.accountInfo.account,
        serviceAddr : this.accountInfo.server,
      },
      {
        enterpriseId : this.enterpriseInfo.enterpriseId,
      },
    ));
  }

  async updateClientInfo(info) {
    const { enterpriseId, clientId } = info;

    if (enterpriseId) deviceManagement.clientUpdate(clientId, info);
    ylDeviceManagement.clientUpdate(clientId, info);
  }

  clientHeart({ enterpriseId, clientId }) {
    if (enterpriseId) deviceManagement.clientHeart(clientId);
    ylDeviceManagement.clientHeart(clientId);
  }

  startHeartBeat(info) {
    this.clientHeart(info);

    const heartTimer = (timeout) => {
      global.clientHeartTimer = setTimeout(async() => {
        this.clientHeart(info);
        heartTimer(5 * 60 * 1000 - this.getRandomByRange(30 * 1000, 60 * 1000));
      }, timeout);
    };

    heartTimer(5 * 60 * 1000 - this.getRandomByRange(30 * 1000, 60 * 1000));
  }

  stopHeartBeat() {
    clearTimeout(global.clientHeartTimer);
  }

  getRandomByRange(a, b) {
    const c = b - a + 1;

    return Math.floor(Math.random() * c + a);
  }
}
