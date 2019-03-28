import Vuem from './vuem';
import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import { wait } from '../utils';
import { LOGIN, MAIN, CONFERENCE, CALL } from '../router/constants';

const model = new Vuem();

model.provide({
  data() {
    return {
      loginPopup         : null, // 登录中的 popup 提示
      enterPopup         : null, // 正在进入会议的 popup 提示
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
            router.push(MAIN.MEETING_INSTANCE);
          }
        }
        else { // 未登录状态
          router.push(LOGIN.LOGIN_CONTENT);
        }

        if (this.loginPopup) popup.destroy(this.loginPopup);
      }
    },
    handleEnterMeeting(val, once) {
      if (val === 'connecting') { // 正在入会状态
        if (!this.enterPopup || this.enterPopup._isDestroyed) {
          this.enterPopup = popup.prepared('loadingModal', { content: '正在进入会议...' }).display();
          this.enterPopup.vm.$once('cancel', () => {
            rtc.conference.leave();
            popup.destroy(this.enterPopup);
          });
        }
      }
      else {
        if (val === 'connected') { // 入会成功
          router.push(CONFERENCE.CONFERENCE_MAIN);
        }
        else if (once === 'connected' && val === 'disconnected') { // 退出会议
          this.isInMiniConference = false;
        }
        if (this.enterPopup) popup.destroy(this.enterPopup);
      }
    },
    handleCall(val, once) {
      if (val === 'ringing') { // 来点
        this.openCallWindow(); // 打开右下角的小窗口
      }
      else if (val === 'connecting' || (once === 'ringing' && val === 'connected')) { // 拨号 或者 来电接通
        router.push(CALL.CALL_MAIN);
      }
      else if (once && val === 'disconnected') {
        this.isInMiniCall = false;
      }
    },
    openCallWindow() {
      const width = 320;
      const height = 180;
      const offsetLeft = window.screen.width - width - 10;
      const offsetTop = window.screen.height - height - 10;

      const option = `width=${width},height=${height},left=${offsetLeft},top=${offsetTop}directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no`;

      window.open('ringing.html', 'ringing', option);
    },
    requestPermission() {
      const permission = Notification.permission;

      if (permission === 'denied' || permission === 'default') {
        return Notification.requestPermission();
      }

      return Promise.resolve();
    },
    notify(info) {
      this.requestPermission().then(() => {
        const notification = new Notification(info.subject, {
          body : '请加入会议',
        });

        notification.onclick = () => {
          this.$dispatch('meeting.joinMeeting', {
            number       : info['conference-number'],
            pin          : info['presenter-pin'],
            initialVideo : true,
            initialAudio : true,
          });
        };
      });
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
  async created() {
    await this.$nextTick();

    const schedule = this.$getVM('schedule');

    schedule.$on('schedule-event', (info) => {
      this.notify(info);
    });
  },
});

export default model;
