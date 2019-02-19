import rtc from '../../rtc';
import storage from '../../storage';

export default {
  data() {
    return {
      meetingRecord : storage.query('MEETING_INFO_RECORD') || {},
    };
  },
  methods : {
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
};
