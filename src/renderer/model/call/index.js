import net from 'net';
import Vuem from '../vuem';
import rtc from '../../rtc';
import chat from './chat';
import state from './state';
import sketch from './sketch';
import popup from '../../popup';

const model = new Vuem();

model.mount('chat', chat);
model.mount('state', state);
model.mount('sketch', sketch);

model.provide({
  data() {
    return {
      isVideoCall      : null,
      isChangeCallType : false,
      callNumber       : '',
      isSwitching      : false,
    };
  },
  middleware : {
    call(ctx) {
      let { number } = ctx.payload;
      // 判断是否为IP 直播 10.81.45.13 or 10*86*5*3isVideoCall

      number = number.replace(/\*/g, '.');

      this.isVideoCall = ctx.payload.options.video;

      if (net.isIP(number)) {
        return rtc.ipcall.connect(number);
      }
      const { call } = rtc;

      call.target = number;

      return call.connect('send', ctx.payload.options);
    },
    answer(ctx) {
      const { isVideoCall } = ctx.payload;

      this.isChangeCallType = typeof isVideoCall === 'boolean';

      // FIXME 音视频切换的时序问题
      rtc.call.answer().then(() => {
        setTimeout(() => {
          if (typeof isVideoCall === 'boolean') {
            this.isVideoCall = isVideoCall;
          }
        }, 500);
      });
    },
    decline() {
      rtc.call.decline().catch(() => {});
    },
    async upgrade(ctx, next) {
      await next();
      
      return rtc.call.upgrade(ctx.payload, { subject: `${rtc.account.username} 的视频会议` });
    },
  },
  computed : {
    remoteStream() {
      return rtc.call.remoteStream;
    },
    isConnected() {
      return rtc.call.connected;
    },
  },
  watch : {
    isVideoCall : {
      async handler(val) {
        if (!rtc.call.connected || val == null) return;
        this.isSwitching = true;
        await rtc.call.localMedia.acquireDetachedStream(true, val)
          .then((s) => rtc.call.channel.replaceLocalStream(s));
        this.isSwitching = false;
      },
      immediate : true,
    },
    remoteStream(val) {
      if (!this.isConnected) return;
      if (this.isChangeCallType) {
        this.isChangeCallType = false;

        return;
      }
      console.warn('RemoteStream Changed');
      console.warn(`VideoTracks:${val.getVideoTracks().length}`);
      this.isVideoCall = val && val.getVideoTracks().length > 0;
    },
    isConnected(val) {
      if (!val) {
        this.isVideoCall = null;
        this.isSwitching = false;
      }
    },
  },
});

model.use(async(ctx, next) => {
  if ((ctx.method === 'call' || ctx.method === 'answer')
    && (!rtc.call.disconnected
      || (!rtc.conference.disconnected && !rtc.conference.connectFailed))) {
    let content = '';

    let ensureFn = null;

    if (!rtc.conference.disconnected && rtc.call.ringing) { // 会议中（即将进入和已经进入）来电即将接通
      content = '接通来电将离开会议，请确认!';
      ensureFn = rtc.conference.leave;
    }
    else if (!rtc.conference.disconnected) { // 会议中（即将进入和已经进入）呼叫
      content = '拨打电话将离开会议，请确认!';
      ensureFn = rtc.conference.leave;
    }
    else if (rtc.call.ringing && rtc.call.status === 'confirmed') { // 通话中来电即将接通
      content = '接通来电将挂断当前通话，请确认!';
      // TODO NOT WORK ?
      // ensureFn = rtc.call.channel.disconnect;
    }
    else { // 通话中拨号
      content = '拨打电话将挂断当前通话，请确认!';
      ensureFn = rtc.call.disconnect;
    }
    //
    // 当前是否在会议中
    const ensurePopup = popup.prepared('ensureModal', { content });

    ensurePopup.display();
    ensurePopup.vm.$once('cancel', () => {
      popup.destroy(ensurePopup);
    });
    await ensurePopup.vm.$once('ok', async() => {
      // 离开会议并开始拨打电话
      if (!ensureFn) {
        await rtc.call.channel.disconnect();
      }
      else {
        await ensureFn();
      }
      popup.destroy(ensurePopup);
      await next();
    });
    
    return;
  }
  await next();
});

export default model;
