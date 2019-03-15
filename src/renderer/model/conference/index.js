import Vuem from 'vuem';
import sketch from './sketch';
import state from './state';
import share from './share';
import member from './member';
import chat from './chat';
import rtc from '../../rtc';

const model = new Vuem();

model.mount('sketch', sketch);
model.mount('state', state);
model.mount('share', share);
model.mount('member', member);
model.mount('chat', chat);

model.provide({
  data() {
    return {
      noticeTextList     : [],
      messageTextList    : [],
      isLocalUnmuteAudio : false,
    };
  },
  computed : {
    audioStatus() { // unblock block unblocking
      if (!this.currentUser) return null;

      const { ingress } = this.currentUser.getAudioFilter();

      let status = ingress ? ingress['#text'] : 'unblock';

      if (this.profile === 'demonstrator' && status === 'block'
        && !this.isPresenter && this.muteBlockBy === 'server') status = 'hand';

      return status;
    },

    videoStatus() { // block unblock
      if (!this.currentUser) return 'unblock';
      const { ingress } = this.currentUser.getVideoFilter();

      return ingress ? ingress['#text'] : 'unblock';
    },
    muteBlockBy() {
      if (!this.currentUser) return null;
      const { ingress } = this.currentUser.getAudioFilter();

      return ingress ? ingress['@blockby'] : 'client';
    },
    currentUser() {
      return rtc.conference.information.users.currentUser;
    },
    isPresenter() {
      return this.currentUser && this.currentUser.isPresenter();
    },
    profile() {
      return rtc.conference.information.description.profile;
    },
    addedUser() {
      return rtc.conference.addedUser;
    },
    deletedUser() {
      return rtc.conference.deletedUser;
    },
  },
  middleware : {
    async toggleAudio(ctx, next) {
      if (!this.currentUser) return;
      let ingress = true;

      ingress = [ 'block', 'hand' ].some((item) => item === this.audioStatus);
      this.isLocalUnmuteAudio = true;

      return this.currentUser.setAudioFilter({ ingress }).catch((error) => {
        this.noticeTextList.push(error.reason['@text']);
        throw error;
      });
    },
    async toggleVideo() {
      if (!this.currentUser) return;
      const ingress = this.videoStatus !== 'unblock';

      this.currentUser.setVideoFilter({ ingress }).catch((error) => {
        this.noticeTextList.push(error.reason['@text']);
      });
    },
  },
  methods : {
    onAudioStatusChanged(status, oldStatus) {
      if (!oldStatus) return;

      switch (status) {
        case 'block':
        case 'hand':
          if (this.muteBlockBy !== 'client' && oldStatus !== 'unblocking') {
            this.noticeTextList.push('您被主持人禁言');
          }
          else if (this.profile === 'demonstrator' && oldStatus === 'unblocking') {
            this.noticeTextList.push(this.isLocalUnmuteAudio ? '您取消了发言申请' : '您的发言申请被拒绝');
          }
          break;
        case 'unblock':
          if (this.muteBlockBy !== 'client' && !this.isLocalUnmuteAudio) {
            this.noticeTextList.push(oldStatus === 'unblocking' ? '您的发言申请被允许' : '您被主持人解除禁言');
          }
          break;
        case 'unblocking':
          this.noticeTextList.push('您正在申请发言');
          break;
        default:
          break;
      }
      this.isLocalUnmuteAudio = false;
    },
  },
  watch : {
    audioStatus : 'onAudioStatusChanged',
    addedUser(val) {
      this.messageTextList.push(`${val.displayText} 加入会议`);
    },
    deletedUser(val) {
      this.messageTextList.push(`${val.displayText} 离开会议`);
    },
  },
});

export default model;
