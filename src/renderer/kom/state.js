import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import storage, { LOGIN_STORAGE } from '../storage';

import { LOGIN, MAIN, CONFERENCE, CALL } from '../router/constants';

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
      isInCallView       : false,
      isOnLine           : true,
    };
  },
  computed : {
    // 登录状态 disconnected connecting registering registered disconnected
    loginStatus : () => rtc.account.status,
    // 会议状态 disconnected connecting connected disconnected
    confStatus  : () => rtc.conference.status,
    // 通话状态 ringing connecting connected disconnected
    // connecting   : 呼叫
    // connected    : 通话中
    // ringing      : 来电
    // disconnected : 通话结束
    callStatus() {
      if (rtc.call.ringing) return 'ringing';
      else if (rtc.call.connecting) return 'connecting';
      else if (rtc.call.connected) return 'connected';
      else return 'disconnected';
    },
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
          await wait(2000); // 添加延时 增加体验
          router.push(MAIN.SETTING_ACCOUNT);
        }
        else {
        // 未登录状态
          const serverType = storage.query(LOGIN_STORAGE.SERVER_TYPE);

          router.push(serverType === 'cloud' ? LOGIN.CLOUD_LOGIN : LOGIN.YMS_LOGIN);
          this.isOnLine = navigator.onLine;
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
          // TODO 点击左侧导航 然后返回会议页面 最后退出路由出错
          if (this.isInConferenceView) {
            if (this.sidebarStatus.preRoute) router.push(this.sidebarStatus.preRoute.path);
            this.isInConferenceView = false;
          }
        }
        else {
          // 未入会状态
        }
      }
    },
    async handleCall(val, once) {
      if (val === 'ringing') { // 来电
        this.sidebarStatus.preRoute = router.currentRoute;
        const width = 270;
        const height = 180;
        const offsetLeft = window.screen.width - width - 10;
        const offsetTop = window.screen.height - height - 10;

        const option = `width=${width},height=${height},left=${offsetLeft},top=${offsetTop}directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no`;

        window.open('ringing.html', 'screenShare', option);
      }
      else if (val === 'connecting') {
        this.sidebarStatus.preRoute = router.currentRoute;
        this.isInCallView = true;

        router.push(CALL.CALL_CONNECTING);
      }
      else if (val === 'connected') {
        this.isInCallView = true;

        router.push(CALL.CALL_CONNECTED);
      }
      else if (once && val === 'disconnected') {
        await wait(1000); // 添加延时 增加体验
        if (this.sidebarStatus.preRoute) router.push(this.sidebarStatus.preRoute.path);
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
    callStatus : {
      handler   : 'handleCall',
      immediate : true,
    },
  },
};
