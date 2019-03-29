import Vuem from '../vuem';
import rtc from '../../rtc';
import storage from '../../storage';
import { formatServers } from '../utils';
import { LOGIN_STORAGE } from '../../storage/constants';

const model = new Vuem();

model.provide({
  data() {
    return {
      meetingRecord : null,
    };
  },
  computed : {
    serverType() {
      return this.$parent.account.serverType;
    },
    loginType() {
      return this.$parent.account.loginType;
    },
    isRegistered() {
      return rtc.account.registered;
    },
  },
  middleware : {
    async joinMeeting(ctx, next) {
      await next();
      const {
        number,
        pin,
        initialVideo,
        initialAudio,
      } = ctx.payload || this.meetingRecord;
      const { conference } = rtc;

      conference.number = number;
      conference.pin = pin;

      return conference.join({
        initialVideo,
        initialAudio,
      }).then(() => {
        storage.insert('MEETING_INFO_RECORD', this.meetingRecord);
      });
    },
    async meetnow(ctx, next) {
      await next();

      return rtc.conference.meetnow(ctx.payload.checked, ctx.payload.options);
    },
    async anonymousJoin(ctx, next) {
      await next();

      const anonMeetingRecord = ctx.payload;

      let noticeText = '';

      if (!anonMeetingRecord.number) {
        noticeText = '会议号码不可为空';
      }
      else if (!anonMeetingRecord.server) {
        noticeText = '服务器地址不可为空';
      }
      else if (!anonMeetingRecord.displayName) {
        noticeText = '昵称不可为空';
      }
      if (noticeText) {
        throw new Error(noticeText);
      }


      const { number,
        pin,
        server,
        proxy,
        proxyPort,
        protocol = 'wss',
        displayName,
        initialVideo,
        initialAudio,
      } = anonMeetingRecord;
      const { conference } = rtc;

      conference.number = number;
      conference.pin = pin;

      const port = proxyPort || (this.serverType === 'cloud' && protocol === 'wss' ? 7443 : 5061);

      const servers = await formatServers({ server, protocol, proxy, port });

      return rtc.conference.anonymousJoin({
        domain       : server,
        display_name : displayName,
        servers,
        initialVideo,
        initialAudio,
      }).then(() => {
        const meetingData = Object.assign({
          lastLoginDate : Date.now(),
          type          : this.serverType,
        }, anonMeetingRecord);

        storage.insertOrUpdate(LOGIN_STORAGE.MEETING_ACCOUNT_LIST, meetingData, 'number');
      });
    },
  },
  watch : {
    isRegistered(val) {
      this.meetingRecord = storage.query('MEETING_INFO_RECORD');
      if (!this.meetingRecord || !this.meetingRecord.number) {
        this.meetingRecord = {
          number       : '',
          pin          : '',
          server       : '',
          initialVideo : true,
          initialAudio : true,
        };
      }
    },
  },
});


export default model;
