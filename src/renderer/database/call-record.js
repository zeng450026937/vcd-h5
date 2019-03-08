import Base from './base';

export class CallRecord extends Base {
  async getRecordByOtherId(val) { // otherId 通话过程中 对方的id
    return this.find('callRecord', 'otherId', val).toArray();
  }
}

export const callRecord = new CallRecord(
  'callRecord',
  {
    callRecord : '++id, type, callId,  otherId',
  },
  1,
);


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
