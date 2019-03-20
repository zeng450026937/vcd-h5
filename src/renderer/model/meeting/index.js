import Vuem from '../vuem';
import rtc from '../../rtc';
import storage from '../../storage';
import { formatServers } from '../utils';


export default new Vuem().provide({
  data() {
    let meetingRecord = storage.query('MEETING_INFO_RECORD');

    let anonMeetingRecord = storage.query('ANON_MEETING_INFO_RECORD');

    if (!meetingRecord || !meetingRecord.number) {
      meetingRecord = { number: '', pin: '', server: '' };
    }

    if (!anonMeetingRecord || !anonMeetingRecord.number) {
      anonMeetingRecord = { number: '', pin: '', server: '', proxy: '', proxyPort: '' };
    }
    
    return {
      meetingRecord,
      anonMeetingRecord,
    };
  },
  computed : {
    serverType() {
      return this.$parent.account.serverType;
    },
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
    async anonymousJoin(ctx, next) {
      await next();

      const { number, pin, server, proxy, proxyPort, protocol = 'wss', displayName } = ctx.payload;
      const { conference } = rtc;

      conference.number = number;
      conference.pin = pin;

      const port = proxyPort || (this.serverType === 'cloud' && protocol === 'wss' ? 7443 : 5061);

      const servers = await formatServers({ server, protocol, proxy, port });

      return rtc.conference.anonymousJoin({
        domain       : server,
        servers,
        display_name : displayName,
      }).then(() => {
        this.anonMeetingRecord = {
          number, pin, server, proxy, proxyPort,
        };
        storage.insert('ANON_MEETING_INFO_RECORD', this.anonMeetingRecord);
      });
    },
  },
});
