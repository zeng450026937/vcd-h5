import Vuem from '../vuem';
import rtc from '../../rtc';
import { $t } from '../../i18n';

const member = new Vuem();

member.provide({
  data() {
    return {
      hasNewMeetingApply : false,
      hasNewSpeakApply   : false,
    };
  },
  computed : {
    filterText() {
      return this.$parent.sketch.filterText;
    },
    userList() {
      const { userList } = rtc.conference.information.users;

      return userList;
    },
    memberList() {
      const { userList, broadcastUserCount } = rtc.conference.information.users;
      // 主持人
      const presenterList = userList.filter((user) => user.isPresenter()
        && (user.displayText.indexOf(this.filterText) > -1
          || user.phone.indexOf(this.filterText) > -1));
      // 访客
      const visitorList = userList.filter((user) => !user.isPresenter()
        && !user.isOnHold() && !user.isCastViewer()
        && (user.displayText.indexOf(this.filterText) > -1
          || user.phone.indexOf(this.filterText) > -1));
      // 广播方
      const castViewerList = userList.filter((user) => user.isCurrentUser()
        && !user.isPresenter()
        && !user.isOnHold() && user.isCastViewer()
        && (user.displayText.indexOf(this.filterText) > -1
          || user.phone.indexOf(this.filterText) > -1));

      const memberList = [
        {
          title : $t('conversation.member.presenterTitle', { count: presenterList.length }),
          group : 'presenter',
          list  : presenterList,
        },
        {
          title : $t('conversation.member.visitorTitle', { count: visitorList.length }),
          group : 'visitor',
          list  : visitorList,
        },
      ];
      const broadcastCount = castViewerList.length === 1 ? 1 : broadcastUserCount;

      if (broadcastCount > 0) {
        memberList.push(
          {
            title : $t('conversation.member.castViewerTitle', { count: broadcastCount }),
            group : 'castViewer',
            list  : castViewerList,
          }
        );
      }

      return memberList;
    },
    waitingList() {
      const { userList } = rtc.conference.information.users;
      const holdList = userList.filter((user) => {
        const isOnHold = user.isOnHold();

        if (!isOnHold) user.holdid = -1;
        
        return isOnHold;
      });

      if (!this.addHoldSSID) this.addHoldSSID = this._genSSID('holdid');
      this.addHoldSSID(holdList);

      return holdList.sort((h1, h2) => (h1.holdid > h2.holdid ? -1 : 1));
    },
    speakApplyList() {
      const { userList } = rtc.conference.information.users;
      // 申请发言

      return userList.filter((user) => user.isAudioApplicant()) || [];
    },
    currentUser() {
      return rtc.conference.information.users.currentUser;
    },
    currentUserIsPresenter() {
      return this.currentUser && this.currentUser.isPresenter();
    },
  },
  methods : {
    _genSSID(key) {
      let SSID = 0;
      const addSSID = (holdList) => {
        holdList.forEach((hold) => {
          if (!hold[key] || hold[key] < 0) hold[key] = ++SSID;
        });
      };

      return addSSID;
    },
  },
  watch : {
    waitingList(val, oldVal) {
      this.hasNewMeetingApply = this.currentUserIsPresenter && val && val.length > 0;
      if (oldVal && oldVal.length > 0) {
        oldVal.forEach((user) => {
          if (val.findIndex((v) => v.entity === user.entity) === -1
            && this.userList.findIndex((v) => v.entity === user.entity) !== -1) {
            const text = user.displayText.length > 10 ? `${user.displayText.slice(0, 10)}...` : user.displayText;

            this.$parent.messageTextList.push($t('conversation.main.message.joinMeeting', { target: text }));
          }
        });
      }
    },
    speakApplyList(val) {
      this.hasNewSpeakApply = this.currentUserIsPresenter && val && val.length > 0;
    },
  },
});

export default member;
