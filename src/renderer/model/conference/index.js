import Vuem from '../vuem';
import sketch from './sketch';
import state from './state';
import share from './share';
import member from './member';
import chat from './chat';
import invite from './invite';
import statistics from './statistics';
import rtc from '../../rtc';

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
      holdList           : [
        {
          id       : '1',
          subject  : '来自张三的视频会议',
          interval : '12:00:03',
        },
        {
          id       : '2',
          subject  : '来自李四的视频会议',
          interval : '12:00:03',
        },
      ],
      staticStream : null,
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
  },
  methods : {
    onAudioStatusChanged(status, oldStatus) {
      if (!oldStatus) return;

      switch (status) {
        case 'block':
        case 'hand':
          if (this.muteBlockBy !== 'client' && oldStatus !== 'unblocking') {
            this.$message.warning('您被主持人禁言');
          }
          else if (this.profile === 'demonstrator' && oldStatus === 'unblocking') {
            if (this.isLocalUnmuteAudio) {
              this.$message.info('您取消了发言申请');
            }
            else {
              this.$message.error('您的发言申请被拒绝');
            }
          }
          break;
        case 'unblock':
          if (this.muteBlockBy !== 'client' && !this.isLocalUnmuteAudio) {
            if (oldStatus === 'unblocking') {
              this.$message.success('您的发言申请被允许');
            }
            else {
              this.$message.info('您被主持人解除禁言');
            }
          }
          break;
        case 'unblocking':
          this.$message.info('您正在申请发言');
          break;
        default:
          break;
      }
      this.isLocalUnmuteAudio = false;
    },
    onPermissionChanged(permission, oldPri) {
      // 参会者状态 organizer：组织者， presenter：主持人，attendee：访客 castviewer: 广播方
      if (!oldPri || this.muteBlockBy === 'client') return;

      if (permission === 'presenter') {
        this.$message.info('您被设置为主持人');
      }
      else if (permission === 'attendee' || permission === 'castviewer') {
        this.$message.info('您被设置为访客');
      }
    },
    onDemostateChanged(role, oldRole) {
      if (this.muteBlockBy === 'client') return;
      // uaRolesDemo: UA的演讲角色 -- demonstrator: 演讲者 audience: 观众
      if (role === 'demonstrator' && oldRole === 'audience') {
        this.$message.info('您被设置为演讲者');
      }
      else if (role === 'audience' && oldRole === 'demonstrator') {
        this.$message.info('您被取消演讲权限');
      }
    },
    onRoleChanged(role, oldRole) {
      if (role === 'waiting') this.$message.info('您已被主持人移到会议大厅');
      else if (oldRole === 'waiting') this.$message.info('您已被主持人批准进入会议');
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
    addedUser(val) {
      this.messageTextList.push(`${val.displayText} 加入会议`);
    },
    deletedUser(val) {
      this.messageTextList.push(`${val.displayText} 离开会议`);
    },
  },
});

export default model;
