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
      isVideoCall      : true, // 标志当前会话
      prepareVideoCall : false, // 将要进行的会话
      callNumber       : '',
      callType         : 'video', // for upgrade
      mediaStatus      : { audio: false, video: false },
    };
  },
  middleware : {
    call(ctx) {
      const { number } = ctx.payload;

      let host;

      let target;

      const toIP = (text) => text.replace(/\*/g, '.');

      if (net.isIP(toIP(number))) {
        target = host = toIP(number);
      }
      else if (/(\d+(\*\*\d+)?)@(.+)/.test(number)) {
        target = RegExp.$1;
        host = toIP(RegExp.$3 || RegExp.$2);
      }
      else if (/(.+)##(\d+(\*\*\d*)?)/.test(number)) {
        target = RegExp.$2 || RegExp.$3;
        host = toIP(RegExp.$1);
      }
      if (host && target) {
        return rtc.ipcall.connect({ host, target });
      }
      const { call } = rtc;

      call.target = number;

      this.prepareVideoCall = ctx.payload.options.video;

      return call.connect('send', ctx.payload.options).then(() => {
        this.prepareVideoCall = false;
        this.isVideoCall = ctx.payload.options.video;
        const setting = this.$getVM('setting');

        if (setting.enableLocalVideo) return;
        this.switchCallType(this.isVideoCall);
      }).catch((e) => {
        this.prepareVideoCall = false;
        throw e;
      });
    },
    answer(ctx) {
      const { toAudio, isVideoCall, isInvite } = ctx.payload;

      // FIXME 音视频切换的时序问题
      rtc.call.answer().then(() => {
        setTimeout(() => {
          if (isInvite && toAudio) {
            const conference = this.$getVM('conference');

            conference.sketch.isVideoConference = !toAudio;
          }
          else {
            this.isVideoCall = isVideoCall && !toAudio;
          }
        }, 500);
      });
    },
    decline() {
      rtc.call.decline().catch(() => {});
    },
    async upgrade(ctx, next) {
      await next();

      const toAudio = !this.isVideoCall;
      
      return rtc.call.upgrade(
        ctx.payload,
        { subject: `${rtc.account.username} 的视频会议` },
        { toAudio }
      ).then(() => {
        const conferenceSketch = this.$getVM('conference.sketch');

        conferenceSketch.isVideoConference = !toAudio;
      });
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
  methods : {
    async switchCallType(video) {
      await rtc.call.localMedia.acquireDetachedStream(true, video)
        .then((s) => rtc.call.channel.replaceLocalStream(s));
      if (!video) {
        const { channel } = rtc.call;
        const pc = channel.session.connection;

        pc.getSenders().forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            sender.track.stop();
            pc.removeTrack(sender);
          }
        });
        channel.renegotiate({
          rtcOfferConstraints : { offerToReceiveVideo: video, offerToReceiveAudio: true },
        },
        () => channel[video ? 'unmute' : 'mute']({ video: true }));
      }
    },
  },
  watch : {
    isVideoCall(val) {
      if (val == null) return;
      if (this.isConnected) {
        this.callType = val ? 'video' : 'audio';
      }
      this.switchCallType(val);
      if (!val) { // 不是视频通话 有辅流则关闭辅流
        const shareChannel = rtc.call.share.channel;

        if (shareChannel.localStream || shareChannel.remoteStream) {
          shareChannel.disconnect();
        }
      }
    },
    remoteStream(val) {
      if (!this.isConnected) return;
      if (!val || val.getVideoTracks().length === 0) {
        // for to audio
        this.isVideoCall = false;
      }
    },
    isConnected(val) {
      if (!val) {
        this.isVideoCall = true;
      }
      else if (rtc.call.direction === 'outgoing') {
        rtc.call.channel.renegotiate();
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
