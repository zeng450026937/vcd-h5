import Vuem from '../vuem';
import rtc from '../../rtc';

const invite = new Vuem();

invite.provide({
  data() {
    return {
      inviteRecordList : [], // 邀请成功、邀请失败、邀请中 三种状态
    };
  },
  computed : {
  },
  middleware : {
    async invite(ctx, next) {
      await next();
      const { protocol, address } = ctx.payload;

      const prefix = protocol === 'H.323' ? 'h323:' : 'sip:';

      const _address = address.startsWith(prefix)
      && protocol !== 'rtmp'
        ? address : prefix + address;

      const user = protocol === 'rtmp'
        ? {
          session : [
            {
              '@session-type'     : 'audio-video',
              'rtmp-url'          : _address,
              'video-data-layout' : 'VideoBig',
              'max-video-fs'      : '720P',
            },
          ],
        } : { requestUri: _address };

      const index = this.inviteRecordList.findIndex((r) => r.address === address);

      const record = Object.assign(index > -1 ? this.inviteRecordList[index] : {}, {
        protocol,
        address,
        status : 'inviting',
      });

      if (index === -1) this.inviteRecordList.push(record);

      return rtc.conference.invite(user).then(() => {
        record.status = 'success';
      }).catch((err) => {
        record.status = 'failed';
        throw err;
      });
    },
  },
  methods : {
  },
  watch : {
  },
});

export default invite;
