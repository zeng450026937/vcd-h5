import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import { wait } from '../utils';
import { LOGIN, MAIN, CONFERENCE, CALL } from '../router/constants';

export default {
  data() {
    return {
      loginPopup    : null, // 登录中的 popup 提示
      enterPopup    : null, // 正在进入会议的 popup 提示
      sidebarStatus : { // 记录入会前的 sidebar 的状态信息
        mainRoute : '', // 退出登陆前记录 main 页面的路由
        preRoute  : {}, // 记录加入会议或者p2p通话前的状态
      },
      isInConferenceView : false, // 记录当前页面是否在会议主页面
      isInCallView       : false, // 记录当前页面是否在P2P通话主页面
      isInMiniConference : false, // 记录当前页面是否在会议的小窗口
      isInMiniCall       : false, // 记录当前页面是否在P2P通话的小窗口
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
      if (val === 'connecting' || val === 'registering') { // 正在登录状态
        if (!this.loginPopup || this.loginPopup._isDestroyed) {
          this.loginPopup = popup.prepared('loadingModal', { content: '登录中...' }).display();
          this.loginPopup.vm.$once('cancel', () => {
            rtc.account.signout();
            popup.destroy(this.loginPopup);
          });
        }
      }
      else {
        if (val === 'registered') { // 登录成功状态
          await wait(1000);
          if (this.loginStatus === 'registered') { // 防止中途退出
            router.push(this.sidebarStatus.mainRoute || MAIN.MEETING_INSTANCE);
          }
        }
        else { // 未登录状态
          router.push(LOGIN.LOGIN_CONTENT);
        }
        if (this.loginPopup) popup.destroy(this.loginPopup);
      }
    },
    handleEnterMeeting(val, once) {
      if (val === 'connecting') { // 正在进入会议状态
        if (!this.enterPopup || this.enterPopup._isDestroyed) {
          this.enterPopup = popup.prepared('loadingModal', { content: '正在进入会议...' }).display();
          this.enterPopup.vm.$once('cancel', () => {
            rtc.conference.leave();
            popup.destroy(this.enterPopup);
          });
        }
      }
      else {
        if (val === 'connected') { // 成功入会状态
          this.isInConferenceView = true; // 记住入会前的路由状态 P2P通话的状态则不需要记录
          if (router.currentRoute.path !== CALL.CALL_MAIN) {
            this.sidebarStatus.preRoute = router.currentRoute;
          }
          router.push(CONFERENCE.CONFERENCE_MAIN);
        }
        else if (once === 'connected' && val === 'disconnected') { // 退出会议状态
          if (this.isInConferenceView || this.isInMiniCall) {
            if (this.sidebarStatus.preRoute) router.push(this.sidebarStatus.preRoute.path);
            this.isInConferenceView = false;
          }
          this.isInMiniConference = false;
        }

        if (this.enterPopup) popup.destroy(this.enterPopup);
      }
    },
    handleCall(val, once) {
      if (val === 'ringing') { // 来电
        if (this.isNotInCallOrConference()) { // 解决会议中来电时的preRoute错误
          this.sidebarStatus.preRoute = router.currentRoute;
        }
        this.openCallWindow();
      }
      else if (val === 'connecting' || (once === 'ringing' && val === 'connected')) {
        if (this.isNotInCallOrConference()) {
          this.sidebarStatus.preRoute = router.currentRoute;
        }
        this.isInCallView = true;

        router.push(CALL.CALL_MAIN);
      }
      else if (val === 'connected') { //
      }
      else if (once && val === 'disconnected') {
        if (this.sidebarStatus.preRoute && !this.isInConferenceView) router.push(this.sidebarStatus.preRoute.path);
        this.isInMiniCall = false;
        this.isInCallView = false;
      }
    },
    isNotInCallOrConference() { // 判断当前路由不在Conference 或者 Call 的主页面
      if (this.confStatus === 'connected' && !this.isInMiniConference) {
        // 在会议主页面
        return false;
      }
      else if ((this.callStatus === 'connected' || this.callStatus === 'connecting') && !this.isInMiniCall) {
        return false;
      }

      return true;
    },
    openCallWindow() {
      const width = 320;
      const height = 180;
      const offsetLeft = window.screen.width - width - 10;
      const offsetTop = window.screen.height - height - 10;

      const option = `width=${width},height=${height},left=${offsetLeft},top=${offsetTop}directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no`;

      window.open('ringing.html', 'ringing', option);
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
