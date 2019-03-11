import Base from './base';
import storage from '../storage';

export function genStoreName() {
  const accountInfo = storage.query('CURRENT_ACCOUNT');

  return `callRecord-${accountInfo.account}-${accountInfo.server}`;
}

function genStores() {
  return storage.query('ACCOUNT_LIST').map((item) => `callRecord-${item.account}-${item.server}`);
}

export class CallRecord extends Base {
  static Create() {
    const stores = genStores();
    const options = {};

    stores.forEach((store) => {
      options[store] = '++id, type, callId, otherId';
    });

    return new CallRecord(
      'callRecord',
      options,
      1,
    );
  }

  async getRecordByOtherId(storeName, val) { // otherId 通话过程中 对方的id
    return this.find(storeName, 'otherId', val).toArray();
  }

  async getRecordByRecent(storeName, num) {
    return this.db[storeName]
      .orderBy('id')
      .reverse()
      .limit(num)
      .toArray();
  }
}

const getRandomString = (num = 16) => {
  const allowedChars = '0123456789ABCDEF';

  let result = '';

  for (let i = 0; i < num; ++i) {
    result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  
  return result;
};

export const createRecord = () => ({
  callTitle : getRandomString(),
  type      : Math.random() < 0.5 ? 'incoming' : 'outcall',
  connected : Math.random() < 0.5,
  media     : Math.random() < 0.5 ? 'audio' : 'video',
  callId    : getRandomString(),
  startTime : new Date().valueOf(),
  endTime   : new Date().valueOf() + 1000 * 60 * 30,
  otherId   : getRandomString(),
  other     : {
    name : getRandomString(4),
  },
});
