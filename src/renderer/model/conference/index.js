import Vuem from '../vuem';
import sketch from './sketch';
import state from './state';
import share from './share';
import member from './member';
import chat from './chat';
import invite from './invite';
import statistics from './statistics';
import rtc from '../../rtc';
import { $t } from '../../i18n';

const model = new Vuem();

model.mount('sketch', sketch);
model.mount('state', state);
model.mount('share', share);
model.mount('member', member);
model.mount('chat', chat);
model.mount('invite', invite);
model.mount('statistics', statistics);

model.provide({
  data() {
    return {
      messageTextList    : [],
      isLocalUnmuteAudio : false,
      holdList           : [],
      staticStream       : null,
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
    permission() { // organizer：组织者， presenter：主持人，attendee：与会者
      if (!this.currentUser) return null;

      return this.currentUser.rolesEntry.permission;
    },
    demostate() {
      if (!this.currentUser) return null;

      return this.currentUser.rolesEntry.demostate;
    },
    role() { // 主持人 访客 等待
      if (!this.currentUser) return null;
      const user = this.currentUser;

      if (user.isPresenter()) return 'presenter';
      if (!user.isPresenter()
        && !user.isOnHold() && !user.isCastViewer()) return 'visitor';
      if (!user.isPresenter()
        && !user.isOnHold() && user.isCastViewer()) return 'cast-viewer';
      else return 'waiting';
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
        this.$message.error(error.reason['@text']);
        throw error;
      });
    },
    async toggleVideo(ctx, next) {
      if (!this.currentUser) return;
      const ingress = this.videoStatus !== 'unblock';

      this.currentUser.setVideoFilter({ ingress }).catch((error) => {
        this.$message.error(error.reason['@text']);
        throw error;
      });
    },

    /**
     * 更新成员的麦克风状态
     * @param user 成员
     * @param ingress 更新为的状态 true 开启声音 false 关闭声音
     */
    async updateAudioStatus(ctx, next) {
      const { user, ingress } = ctx.payload;

      if (user.isCurrentUser()) this.isLocalUnmuteAudio = true;

      user.setAudioFilter({ ingress }).then(() => {}).catch(() => {});
    },

    /**
     * 更新成员的摄像头状态
     * @param user 成员
     * @param ingress 更新为的状态 true 开启视频 false 关闭视频
     */
    async updateVideoStatus(ctx, next) {
      const { user, ingress } = ctx.payload;

      user.setVideoFilter({ ingress });
    },

    async handleMeetingApply(ctx, next) {
      const { user, status } = ctx.payload;

      const { lobby } = rtc.conference.conference;

      if (status) {
        lobby.allow(user.entity).then(() => {
          const text = user.displayText.length > 10 ? `${user.displayText.slice(0, 10)}...` : user.displayText;

          this.messageTextList.push($t('conversation.main.message.joinMeeting', { target: text }));
        });
      }
      else {
        lobby.refuse(user.entity);
      }
    },
  },
  methods : {
    onAudioStatusChanged(status, oldStatus) {
      if (!oldStatus) return;

      switch (status) {
        case 'block':
        case 'hand':
          if (this.muteBlockBy !== 'client' && oldStatus !== 'unblocking') {
            this.$message.warning($t('conversation.main.message.mute'));
          }
          else if (this.profile === 'demonstrator' && oldStatus === 'unblocking') {
            if (this.isLocalUnmuteAudio) {
              this.$message.info($t('conversation.main.message.cancelSpeakApply'));
            }
            else {
              this.$message.error($t('conversation.main.message.speakApplyRefused'));
            }
          }
          break;
        case 'unblock':
          if (this.muteBlockBy !== 'client' && !this.isLocalUnmuteAudio) {
            if (oldStatus === 'unblocking') {
              this.$message.success($t('conversation.main.message.speakApplyAllowed'));
            }
            else {
              this.$message.info($t('conversation.main.message.unMute'));
            }
          }
          break;
        case 'unblocking':
          this.$message.info($t('conversation.main.message.applying'));
          break;
        default:
          break;
      }
      this.isLocalUnmuteAudio = false;
    },
    onPermissionChanged(permission, oldPri) {
      // console.warn(permission, oldPri);
      // 参会者状态 organizer：组织者， presenter：主持人，attendee：访客 castviewer: 广播方
      if (!oldPri || this.muteBlockBy === 'client') return;

      if (permission === 'presenter') {
        this.$message.info($t('conversation.main.message.toPresenter'));
      }
      else if (permission === 'attendee' || permission === 'castviewer') {
        this.$message.info($t('conversation.main.message.toVisitor'));
      }
    },
    onDemostateChanged(role, oldRole) {
      // console.warn(role, oldRole);
      if (this.muteBlockBy === 'client') return;
      // uaRolesDemo: UA的演讲角色 -- demonstrator: 演讲者 audience: 观众
      if (role === 'demonstrator' && oldRole === 'audience') {
        this.$message.info($t('conversation.main.message.toSpeaker'));
      }
      else if (role === 'audience' && oldRole === 'demonstrator') {
        this.$message.info($t('conversation.main.message.cancelSpeaker'));
      }
    },
    onRoleChanged(role, oldRole) {
      if (oldRole && role === 'waiting') this.$message.info($t('conversation.main.message.toConferenceHall'));
      else if (role && oldRole === 'waiting') this.$message.info($t('conversation.main.message.allowToConference'));
      else if (!role && oldRole) {
        const { reason } = rtc.conference;

        if (!reason || (reason.cause === 'User Deleted')) {
          this.$message.info($t('conversation.main.message.kickFromMeeting'));
        }
      }
    },
    getUserAudioStatus(user) {
      if (user.isCurrentUser()) {
        return this.audioStatus;
      }
      if (!user.getAudioFilter().ingress) return 'unblock';

      return user.getAudioFilter().ingress['#text'] || 'unblock';
    },
    getUserVideoStatus(user) {
      if (user.isCurrentUser()) {
        return this.videoStatus;
      }
      if (!user.getVideoFilter().ingress) return 'unblock';

      return user.getVideoFilter().ingress['#text'] || 'unblock';
    },
  },
  watch : {
    audioStatus : 'onAudioStatusChanged',
    permission  : 'onPermissionChanged',
    demostate   : 'onDemostateChanged',
    role        : 'onRoleChanged',
    async addedUser(val) {
      await Promise.resolve();
      const text = val.displayText.length > 10 ? `${val.displayText.slice(0, 10)}...` : val.displayText;

      this.messageTextList.push(val.isOnHold()
        ? $t('conversation.main.message.enterHall', { target: text })
        : $t('conversation.main.message.joinMeeting', { target: text }));
    },
    deletedUser(val) {
      const text = val.displayText.length > 10 ? `${val.displayText.slice(0, 10)}...` : val.displayText;

      this.messageTextList.push($t('conversation.main.message.exitMeeting', { target: text }));
    },
  },
});

export default model;
