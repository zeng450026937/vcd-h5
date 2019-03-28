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
      isVideoCall : false,
      callNumber  : '',
    };
  },
  middleware : {
    call(ctx) {
      let { number } = ctx.payload;
      // 判断是否为IP 直播 10.81.45.13 or 10*86*5*3isVideoCall

      number = number.replace(/\*/g, '.');

      if (net.isIP(number)) {
        return rtc.ipcall.connect(number);
      }
      const { call } = rtc;

      call.target = number;

      this.isVideoCall = ctx.payload.options.video;

      return call.connect('send', ctx.payload.options);
    },
    answer() {
      rtc.call.answer().catch(() => {});
    },
    decline() {
      rtc.call.decline().catch(() => {});
    },
  },
  watch : {
    isVideoCall : {
      handler(val) {
        if (!rtc.call.connected) return;
        if (val) { // 视频通话 -> 关掉音频
          rtc.call.channel.session.connection.getSenders().forEach((sender) => {
            if (sender.track.kind === 'video') {
              sender.track.stop();
              rtc.call.channel.session.connection.removeTrack(sender);
            }
            else {

            }
          });
        }
        else { // 音频通话 -> 关掉视频
          rtc.call.channel.session.connection.getSenders().forEach((sender) => {
            if (sender.track.kind === 'video') {
              sender.track.stop();
              rtc.call.channel.session.connection.removeTrack(sender);
            }
            else {

            }
          });
        }
      },
      immediate : true,
    },
  },
});

model.use(async(ctx, next) => {
  if ((ctx.method === 'call' || ctx.method === 'answer')
    && (!rtc.call.disconnected || !rtc.conference.disconnected)) {
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
