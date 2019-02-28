import { get } from 'lodash';
import { deviceManagement, ylDeviceManagement } from './api/deviceManagements';
import { getEnterpriseInfo } from './api/enterprise';


const states = {
  START_UP   : 0,
  USER_LOGIN : 1,
};

export default class ClientManagement {
  constructor(systemInfo) {
    this.count = 0;
    this.accountInfo = {};
    this.systemInfo = systemInfo;
    this.getEnterpriseInfo();
  }

  get state() {
    return this.stateProxy;
  }

  set state(state) {
    switch (state) {
      case states.START_UP: {
        this.updateClientInfo(this.clientInfo);
        this.startHeartBeat(this.clientInfo);
        break;
      }
      case states.USER_LOGIN: {
        this.updateClientInfo(this.clientInfo);
        break;
      }
      default:
        break;
    }
    this.stateProxy = state;
  }

  get clientInfo() {
    return {
      ...this.systemInfo,
      account      : get(this, 'accountInfo.account', null),
      serviceAddr  : get(this, 'accountInfo.server', null),
      enterpriseId : get(this, 'enterpriseInfo.id', null),
    };
  }

  get enterpriseInfo() {
    return this.enterpriseInfoProxy;
  }

  set enterpriseInfo(info) {
    this.enterpriseInfoProxy = info;
    this.stopHeartBeat();
    this.updateClientInfo(this.clientInfo);
    this.startHeartBeat(this.clientInfo);
  }

  async getEnterpriseInfo() {
    try {
      this.count++;
      const res = await getEnterpriseInfo();

      this.enterpriseInfo = res.data.data.enterprise;
    }
    catch (e) {
      if (this.count > 20) return;

      return setTimeout(() => this.getEnterpriseInfo(), 10 * 1000);
    }
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
