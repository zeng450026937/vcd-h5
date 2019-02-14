import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import { LOGIN, MAIN, CONFERENCE } from '../router/constants';

const wait = async(timeout = 0) => new Promise((resolve) => {
  if (timeout) {
    setTimeout(() => {
      resolve();
    }, timeout);
  }
});

export default {
  data() {
    return {
      loginPopup         : null, // 登录中的 popup 提示
      enterPopup         : null, // 正在进入会议的 popup 提示
      sidebarStatus      : {}, // 记录入会前的 sidebar 的状态信息
      isInConferenceView : false,
    };
  },
  computed : {
    // 登录状态 disconnected connecting registering registered disconnected
    loginStatus : () => rtc.account.status,
    // 会议状态 disconnected connecting connected disconnected
    confStatus  : () => rtc.conference.status,
  },
  methods : {
    async handleLogin(val, once) {
      if (val === 'connecting' || val === 'registering') {
        // 正在登录状态
        if (!this.loginPopup || this.loginPopup._isDestroyed) {
          this.loginPopup = popup.prepared('loadingModal', {
            content : '登录中...',
          }).display();
          this.loginPopup.vm.$once('cancel', () => {
            rtc.account.signout();
            popup.destroy(this.loginPopup);
          });
        }
      }
      else {
        if (val === 'registered') {
          // 登录成功状态
          await wait(1000); // 添加延时 增加体验
          router.push(MAIN.CONTACT_CORPORATE);
        }
        else if (once === 'registered' && val === 'disconnected') {
        // 退出状态
          router.push(LOGIN.YMS_LOGIN);
        }
        else {
        // 未登录状态
          router.push(LOGIN.YMS_LOGIN);
        }
        if (this.loginPopup) popup.destroy(this.loginPopup);
      }
    },
    handleEnterMeeting(val, once) {
      if (val === 'connecting') {
        // 正在进入会议状态
        if (!this.enterPopup || this.enterPopup._isDestroyed) {
          this.enterPopup = popup.prepared('loadingModal', {
            content : '正在进入会议...',
          }).display();
          this.enterPopup.vm.$once('cancel', () => {
            rtc.conference.leave();
            popup.destroy(this.enterPopup);
          });
        }
      }
      else {
        if (this.enterPopup) popup.destroy(this.enterPopup);
        if (val === 'connected') {
          // 记住入会前的路由状态
          this.sidebarStatus.preRoute = router.currentRoute;
          this.isInConferenceView = true;
          // 成功入会状态
          router.push(CONFERENCE.CONFERENCE_MAIN);
        }
        else if (once === 'connected' && val === 'disconnected') {
          // 退出会议状态
          if (this.isInConferenceView) {
            router.push(this.sidebarStatus.preRoute.path);
            this.isInConferenceView = false;
          }
        }
        else {
          // 未入会状态
        }
      }
    },
  },
  watch : {
    loginStatus : {
      handler   : 'handleLogin',
      immediate : true,
    },
    confStatus : {
      handler   : 'handleEnterMeeting',
      immediate : true,
    },
  },
};
