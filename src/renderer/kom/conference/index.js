import rtc from '../../rtc';
// import model from '../../model';

export default {
  data() {
    return {
      noticeTextList     : [],
      messageTextList    : [],
      isLocalUnmuteAudio : false,
      selectedMember     : '',
      hideControls       : false, // 是否隐藏会议页面底部和头部的控制按钮
    };
  },
  computed : {

    addedUser() {
      return rtc.conference.addedUser;
    },
    deletedUser() {
      return rtc.conference.deletedUser;
    },

    currentUser() {
      return rtc.conference.information.users.currentUser;
    },
    
    profile() {
      return rtc.conference.information.description.profile;
    },
  
    isPresenter() {
      if (!this.currentUser) return false;
      
      return this.currentUser.isPresenter();
    },
    isOrganizer() {
      if (!this.currentUser) return false;
      
      return this.currentUser.isOrganizer();
    },
    
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
    
    permission() {
      if (!this.currentUser) return null;
      
      // organizer：组织者， presenter：主持人，attendee：与会者
      return this.currentUser.rolesEntry.permission;
    },
    demostate() {
      if (!this.currentUser) return null;
      
      return this.currentUser.rolesEntry.demostate;
    },
    
    muteBlockBy() {
      if (!this.currentUser) return null;
      const { ingress } = this.currentUser.getAudioFilter();
      
      return ingress ? ingress['@blockby'] : 'client';
    },
    userList() {
      const { userList } = rtc.conference.information.users;
      
      return userList;
    },
    memberList() {
      const { userList } = rtc.conference.information.users;
      // 主持人
      const presenterList = userList.filter((user) => user.isPresenter());
      // 访客
      const visitorList = userList.filter((user) => !user.isPresenter() && !user.isOnHold());

      return [
        {
          title : `主持人 (${presenterList.length})`,
          list  : presenterList,
        },
        {
          title : `访客 (${visitorList.length})`,
          list  : visitorList,
        },
      ];
    },
    waitingList() {
      const { userList } = rtc.conference.information.users;
      // 等待大厅

      return userList.filter((user) => user.isOnHold());
    },
    speakApplyList() {
      const { userList } = rtc.conference.information.users;
      // 申请发言

      return userList.filter((user) => user.isAudioApplicant()) || [];
    },
  },
  methods : {
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
    onPermissionChanged(permission, oldPri) {
      // 参会者状态 organizer：组织者， presenter：主持人，attendee：访客 castviewer: 广播方
      if (!oldPri || this.muteBlockBy === 'client') return;
      
      if (permission === 'presenter') {
        this.noticeTextList.push('您被设置为主持人');
      }
      else if (permission === 'attendee' || permission === 'castviewer') {
        this.noticeTextList.push('您被设置为访客');
      }
    },
    onDemostateChanged(role, oldRole) {
      if (this.muteBlockBy === 'client') return;
      // uaRolesDemo: UA的演讲角色 -- demonstrator: 演讲者 audience: 观众
      if (role === 'demonstrator' && oldRole === 'audience') {
        this.noticeTextList.push('您被设置为演讲者');
      }
      else if (role === 'audience' && oldRole === 'demonstrator') {
        this.noticeTextList.push('您被取消演讲权限');
      }
    },

    /**
     * 更新成员的麦克风状态
     * @param user 成员
     * @param ingress 更新为的状态 true 开启声音 false 关闭声音
     */
    updateAudioStatus(user, ingress) {
      if (user.isCurrentUser()) this.isLocalUnmuteAudio = true;
      
      user.setAudioFilter({ ingress }).then(() => {
        // model.notice = {
        //   visible : true,
        //   text    : '操作成功',
        //   color   : 'success',
        // };
      }).catch(() => {
        // model.notice = {
        //   visible : true,
        //   text    : '操作失败',
        //   color   : 'error',
        // };
      });
    },
    removeUser(user) {
      user.kick();
    },

    /**
     * 更新成员的麦克风状态
     * @param user 成员
     * @param ingress 更新为的状态 true 开启视频 false 关闭视频
     */
    updateVideoStatus(user, ingress) {
      user.setVideoFilter({ ingress });
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
    
    // 设置为演讲者
    setUserAsSpearker(user) {
    
    },


  },
  watch : {
    audioStatus : 'onAudioStatusChanged',
    permission  : 'onPermissionChanged',
    demostate   : 'onDemostateChanged',
    addedUser(val) {
      this.messageTextList.push(`${val.displayText} 加入会议`);
    },
    deletedUser(val) {
      this.messageTextList.push(`${val.displayText} 离开会议`);
    },
  },
  actions   : {},
  broadcast : {},
  models    : {},
};
