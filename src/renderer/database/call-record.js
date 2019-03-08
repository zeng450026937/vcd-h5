import Base from './base';

class CallRecord extends Base {
  async getRecordByOtherId(val) {
    return this.find('callRecord', 'otherId', val).toArray();
  }
}

export default new CallRecord(
  'callRecord',
  {
    callRecord : '++id, type, channelId,  otherId',
  },
  1,
);

const record = {
  type      : 'incoming',
  connected : true,
  media     : 'audio',
  callId    : '12aewof103f10caof10rj1391030',
  startTime : 123423458293,
  endTime   : 123431492344,
  otherId   : 'eadf13434slf1ff29jf020039103',
  other     : {
    name : '9001',
    id   : '12312312312',
  },
};
