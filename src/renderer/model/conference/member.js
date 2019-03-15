import Vuem from 'vuem';
import rtc from '../../rtc';

const member = new Vuem();

member.provide({
  data() {
    return {
    };
  },
  computed : {
    userList() {
      const { userList } = rtc.conference.information.users;

      return userList;
    },
    memberList() {
      const { userList } = rtc.conference.information.users;
      // 主持人
      const presenterList = userList.filter((user) => user.isPresenter()
        && (user.displayText.indexOf(this.filterText) > -1
          || user.displayText.indexOf(this.phone) > -1));
      // 访客
      const visitorList = userList.filter((user) => !user.isPresenter()
        && !user.isOnHold()
        && (user.displayText.indexOf(this.filterText) > -1
          || user.displayText.indexOf(this.phone) > -1));

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
});

export default member;
