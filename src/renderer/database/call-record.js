import Base from './base';

let db;

export class CallRecord extends Base {
  static Create() {
    if (db) return db;

    return db = new CallRecord(
      'callRecord',
      { records: '++sn, type, id, otherId, [account+server]' },
      1,
    );
  }

  async getRecordByOtherId(val) { // otherId 通话过程中 对方的id
    return this.find('records', 'otherId', val)
      .toArray();
  }

  async getRecordById(val) {
    return this.find('records', 'id', val).toArray().then((records) => records.find((r) => r.id === val));
  }

  async getRecordByRecent(val, num) {
    return this.find('records', '[account+server]', val)
      .reverse()
      .limit(num)
      .toArray();
  }

  async updateRecord(key, val, data) {
    return this.updateByKey('records', key, val, data);
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
