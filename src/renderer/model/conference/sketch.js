import Vuem from '../vuem';
import rtc from '../../rtc';

const sketch = new Vuem();

const initialDate = () => ({
  // 一些可见性的Modal
  isStatisticsVisible : false,
  isSharingVisible    : false,

  hideControls          : false, // 是否隐藏会议页面底部和头部的控制按钮
  isShareInCenter       : false, // 辅流页面是否显示在主页面
  isShareWindowOpen     : false,
  isInConferenceMain    : true,
  showMorePanel         : false, // 底部按钮是否显示更多Panel
  currentTab            : '',
  plateContent          : '', // 会议中拨号盘的内容
  localWindowState      : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  shareWindowState      : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  // 会议中的成员列表 已入会的成员默认展开
  selectedGroup         : '1',
  selectedMember        : '',
  isOpenSearch          : false,
  filterText            : '',
  activeGroupKey        : '1',
  // 锁定会议
  selectedOptions       : 'closedAuthenticated',
  attendeeLobbyBypass   : true,
  // 会议布局
  showMessage           : true, // 入会和离开的提示
  // 是否为视频会议 视频会议 OR 音频会议
  isVideoConference     : true,
  hideMessage           : true,
  // Hold
  updateHoldPosition    : false,
  // Device Exception
  deviceExceptionNotice : {
    instance : null,
    close() {
      if (typeof this.instance === 'function') {
        this.instance();
        this.instance = null;
      }
    },
    open(ctx, videoException, audioException) {
      if (typeof this.instance === 'function') return;
      const h = ctx.$createElement;

      const text = videoException ? '当前摄像头异常，请检查后重试'
        : audioException ? '当前麦克风异常，请检查后重试' : '当前摄像头和麦克风异常，请检查后重试';

      const content = h('div', { class: 'inline-block no-dragable' }, [
        h('div', { class: 'inline-block' }, text),
        h('a-iconfont', {
          class : 'ml-3 mr-0 cursor-pointer text-black9 hover:text-red-light',
          props : { type: 'icon-guanbi' },
          on    : {
            click : () => { this.close(); },
          } }),
      ]);

      this.instance = ctx.$message.warning(content, 0);
    },
  },
});

sketch.provide({
  data() {
    return initialDate();
  },
  computed : {
    conferenceStatus() {
      return rtc.conference.status;
    },
  },
  methods : {
    updateConferenceType(isVideo) {
      const { channel } = rtc.conference.mediaChannel;

      if (!isVideo) {
        const pc = channel.session.connection;

        pc.getSenders().forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            sender.track.stop();
            pc.removeTrack(sender);
          }
        });
      }
      channel.renegotiate({
        rtcOfferConstraints : { offerToReceiveVideo: isVideo, offerToReceiveAudio: true },
      },
      () => channel[isVideo ? 'unmute' : 'mute']({ video: true }));
    },
  },
  watch : {
    conferenceStatus(val, oldVal) {
      if (val === 'disconnected') { // 退出会议之后重置当前状态
        this.deviceExceptionNotice.close();
        Object.assign(this, initialDate());
        this.$getVM('call').callType = 'video';
      }
      else if (val === 'connected' && rtc.conference.mediaChannel.channel._isRefer) {
        const call = this.$getVM('call');

        this.isVideoConference = call.callType === 'video';
      }
    },
    isVideoConference(val) { // TODO 失败了呢? -- 返回值
      if (this.conferenceStatus === 'disconnected') return;
      this.updateConferenceType(val);
    },
  },
});

export default sketch;
