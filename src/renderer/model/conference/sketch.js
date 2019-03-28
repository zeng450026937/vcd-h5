import Vuem from '../vuem';
import rtc from '../../rtc';

const sketch = new Vuem();

const initialDate = () => ({
  hideControls        : false, // 是否隐藏会议页面底部和头部的控制按钮
  isShareInCenter     : false, // 辅流页面是否显示在主页面
  isShareWindowOpen   : false,
  isInConferenceMain  : true,
  showMorePanel       : false, // 底部按钮是否显示更多Panel
  currentTab          : '',
  plateContent        : '', // 会议中拨号盘的内容
  localWindowState    : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  shareWindowState    : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  // 会议中的成员列表
  selectedGroup       : '',
  selectedMember      : '',
  isOpenSearch        : false,
  filterText          : '',
  activeGroupKey      : [],
  // 锁定会议
  selectedOptions     : 'closedAuthenticated',
  attendeeLobbyBypass : true,
  // 会议布局
  currentLayout       : '',
  showMessage         : true, // 入会和离开的提示
  // 是否为视频会议 视频会议 OR 音频会议
  isVideoConference   : true,
  hideMessage         : true,
  // Hold
  updateHoldPosition  : false,
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
  watch : {
    conferenceStatus(val, oldVal) {
      if (val === 'disconnected') { // 退出会议之后重置当前状态
        Object.assign(this, initialDate());
      }
    },
    isVideoConference(val) { // TODO 失败了呢? -- 返回值
      if (this.conferenceStatus === 'disconnected') return;
      rtc.conference.mediaChannel.channel.renegotiate(
        {
          rtcOfferConstraints :
            { offerToReceiveVideo: val, offerToReceiveAudio: true },
        }, () => {
          const method = val ? 'unmute' : 'mute';

          rtc.conference.mediaChannel.channel[method]({ video: true });
        }
      );
    },
  },
});

export default sketch;
