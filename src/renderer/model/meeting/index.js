import Vuem from '../vuem';
import rtc from '../../rtc';
import storage from '../../storage';

export default new Vuem().provide({
  data() {
    let meetingRecord = storage.query('MEETING_INFO_RECORD');

    if (!meetingRecord || !meetingRecord.number) {
      meetingRecord = { number: '', pin: '', server: '' };
    }
    
    return {
      meetingRecord,
    };
  },
  middleware : {
    async joinMeeting(ctx, next) {
      await next();
      const { number, pin } = ctx.payload;
      const { conference } = rtc;

      conference.number = number;
      conference.pin = pin;

      return conference.join().then(() => {
        this.meetingRecord = {
          number : conference.number,
          pin    : conference.pin,
        };
        storage.insert('MEETING_INFO_RECORD', this.meetingRecord);
      });
    },
  },
});
