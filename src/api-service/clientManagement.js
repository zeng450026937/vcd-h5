import { get } from 'lodash';
import { deviceManagement, ylDeviceManagement } from './api/deviceManagements';
import { getEnterpriseInfo } from './api/enterprise';


const states = {
  START_UP   : 0,
  USER_LOGIN : 1,
};

export default class ClientManagement {
  constructor(systemInfo) {
    this.stateProxy = 0;
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
      enterprise : {
        id     : get(this, 'enterpriseInfo.enterprise.id', null),
        name   : get(this, 'enterpriseInfo.enterprise.name', null),
        domain : get(this, 'enterpriseInfo.pushService.url', null),
      },
      user : {
        account  : get(this, 'accountInfo.account', null),
        domain   : get(this, 'accountInfo.server', null),
        outbound : '',
        status   : '',
      },
    };
  }

  get enterpriseInfo() {
    return this.enterpriseInfoProxy;
  }

  set enterpriseInfo(info) {
    this.enterpriseInfoProxy = info;
    this.stopHeartBeat();
    this.resetClient(this.clientInfo);
    this.updateClientInfo(this.clientInfo);
    this.startHeartBeat(this.clientInfo);
  }

  async getEnterpriseInfo() {
    try {
      this.count++;
      const res = await getEnterpriseInfo();

      this.enterpriseInfo = res.data.data;
    }
    catch (e) { // 如果获取不到企业用户 则 只上报到 yealink 管理平台
      if (this.count > 20) {
        this.stopHeartBeat();
        this.resetClient(this.clientInfo);
        this.updateClientInfo(this.clientInfo);
        this.startHeartBeat(this.clientInfo);

        return;
      }

      return setTimeout(() => this.getEnterpriseInfo(), 1000);
    }
  }

  async updateClientInfo(clientInfo) {
    const enterpriseId = get(clientInfo, 'enterprise.id', null);
    const clientId = clientInfo.clientId;

    if (enterpriseId) deviceManagement.clientUpdate(clientId, clientInfo);
    ylDeviceManagement.clientUpdate(clientId, clientInfo);
  }

  resetClient(clientInfo) {
    const enterpriseId = get(clientInfo, 'enterprise.id', null);

    if (enterpriseId) deviceManagement.resetClient(clientInfo);
    ylDeviceManagement.resetClient(clientInfo);
  }

  clientHeart(clientInfo) {
    const enterpriseId = get(clientInfo, 'enterprise.id', null);
    const clientId = clientInfo.clientId;

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
