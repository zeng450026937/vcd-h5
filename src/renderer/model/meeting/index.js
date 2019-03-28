import Vuem from '../vuem';
import rtc from '../../rtc';
import storage from '../../storage';
import { formatServers } from '../utils';
import { LOGIN_STORAGE } from '../../storage/constants';
import popup from '../../popup';

const meeting = new Vuem();

meeting.provide({
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
      } = ctx.payload.meetingRecord || this.meetingRecord;
      const { conference } = rtc;

      conference.number = number;
      conference.pin = pin;

      return conference.join({
        initialVideo,
        initialAudio,
      }).then(() => {
        storage.insert(`MEETING_INFO_RECORD_${this.serverType.toUpperCase()}`, this.meetingRecord);
      });
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
    meetnow(ctx, next) {
      const { users } = ctx.payload;

      rtc.conference.meetnow(users, { subject: `${rtc.account.username} 的视频会议` });
    },
  },
  watch : {
    isRegistered(val) {
      this.meetingRecord = storage.query(`MEETING_INFO_RECORD_${this.serverType.toUpperCase()}`);
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

meeting.use(async(ctx, next) => {
  if ((ctx.method === 'joinMeeting' || ctx.method === 'meetnow')
    && (!rtc.call.disconnected || !rtc.conference.disconnected)) {
    // 当前是否在会议中
    let content = '';

    let ensureFn = null;

    if (rtc.call.connecting) { // 拨号中加入会议
      content = '加入会议将终止呼叫，请确认!';
      ensureFn = rtc.call.disconnect;
    }
    else if (rtc.call.connected) { // 通话中加入会议
      content = '加入会议将终止通话，请确认!';
      ensureFn = rtc.call.disconnect;
    }
    else { // 会议中再次加入会议
      content = '即将退出当前会议，请确认!';
      ensureFn = rtc.conference.leave;
    }
    const ensurePopup = popup.prepared('ensureModal', { content });

    ensurePopup.display();
    ensurePopup.vm.$once('cancel', () => {
      popup.destroy(ensurePopup);
    });
    await ensurePopup.vm.$once('ok', async() => {
      await ensureFn();
      popup.destroy(ensurePopup);
      await next();
    });

    return;
  }
  await next();
});

export default meeting;
