// 这里做统一的流管理
// 需要获取本地视频流的几种情况
/**
 * 1. 视频入会
 * 2. 视频P2P通话
 * */
import Vuem from './vuem';
import rtc from '../rtc';

const model = new Vuem();

model.provide({
  data() {
    return {
    };
  },
  methods : {
  },
  computed : {
    // 通话和会议的类型
    isVideoConference() {
      return this.$parent.conference.sketch.isVideoConference;
    },
    isVideoCall() {
      return this.$parent.call.isVideoCall;
    },
    // 会议中是否需要获取本地视频流
    acquireStreamInConference() {
      return this.isVideoConference && rtc.conference.connected;
    },
    // 会议中是否需要释放本地视频流
    releaseStreamInConference() {
      return (!this.isVideoConference && rtc.conference.connected) // 视频会议 转 音频会议
        || (this.isVideoConference && rtc.conference.status === 'disconnected'); // 挂断视频会议
    },
    // 通话中是否需要获取视频流
    acquireStreamInCall() {
      return this.isVideoCall && rtc.call.connected;
    },
    releaseStreamInCall() {
      return (!this.isVideoCall && rtc.call.connected) // 视频通话 转 音频通话
        || (this.isVideoCall && (rtc.call.status === 'finished' || rtc.call.status === 'ended')); // 挂断视频电话
    },
  },
  watch : {
    acquireStreamInConference(val) {
      if (val) {
        rtc.media.localMedia.acquireStream();
        console.warn('获取会议视频流');
      }
    },
    releaseStreamInConference(val) {
      if (val) {
        if (val) rtc.media.localMedia.releaseStream();
        console.warn('释放会议视频流');
      }
    },
    acquireStreamInCall(val) {
      if (val) {
        rtc.media.localMedia.acquireStream();
        console.warn('获取通话视频流');
      }
    },
    releaseStreamInCall(val) {
      if (val) {
        if (val) rtc.media.localMedia.releaseStream();
        console.warn('释放通话视频流');
      }
    },
  },
});

export default model;
