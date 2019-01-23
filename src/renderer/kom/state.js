import rtc from '../rtc';
import popup from '../popup';
import router from '../router';

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
      loginPopup : null, // 登录中的 popup 提示
      enterPopup : null, // 正在进入会议的 popup 提示
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
          router.push('/main');
        }
        else if (once === 'registered' && val === 'disconnected') {
        // 退出状态
          router.push('/login');
        }
        else {
        // 未登录状态
          router.push('/login/yms');
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
          // 成功入会状态
          console.warn('成功入会');
          router.push('/conference');
        }
        else if (once === 'connected' && val === 'disconnected') {
          // 退出会议状态
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
