import Vuem from './vuem';
import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import { getPath } from '../router/utils';
import { wait } from '../utils';
import { LOGIN, CONFERENCE, CALL } from '../router/constants';
import storage from '../storage';
import { CallRecord } from '../database/call-record';


const callRecordDB = CallRecord.Create();
const model = new Vuem();
const routes = router.options.routes;

model.provide({
  data() {
    return {
      loginPopup          : null, // 登录中的 popup 提示
      enterPopup          : null, // 正在进入会议的 popup 提示
      isInMiniConference  : false, // 记录当前页面是否在会议的小窗口
      isInMiniCall        : false, // 记录当前页面是否在P2P通话的小窗口
      currentConferenceId : null,
      recordUpdate        : null,
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
            router.push(getPath('instance', routes));
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
      if (val === 'ringing') { // 来电
        // 通话中免打扰
        if (rtc.call.status === 'confirmed' && this.$parent.setting.dnd) {
          rtc.call.decline();
          
          return;
        }

        this.openCallWindow(); // 打开右下角的小窗口
      }
      else if (val === 'connecting' || (once === 'ringing' && val === 'connected')) { // 拨号 或者 来电接通
        if (!this.isInMiniCall) { // Mini下挂断新的来电
          router.push(CALL.CALL_MAIN);
        }
      }
      else if (once && val === 'disconnected') {
        this.isInMiniCall = false;
      }
    },
    openCallWindow() {
      const callCount = (window.callCount || 0) + 1;

      if (callCount > 3) {
        return rtc.call.decline();
      }
      const width = 320;
      const height = 180;
      const offsetLeft = window.screen.width - width - 10;
      const offsetTop = window.screen.height - height * callCount - 50;

      const option = `width=${width},height=${height},left=${offsetLeft},top=${offsetTop}directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no`;

      window.callCount = callCount;
      const newWindow = window.open('ringing.html',
        'ringing',
        option);

      newWindow.onunload = function(e) {
        setTimeout(() => {
          if (newWindow.closed) {
            window.callCount--;
          }
        }, 200);
      };
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
    confStatus : [
      {
        handler   : 'handleEnterMeeting',
        immediate : true,
      },
    ],
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

    rtc.account.$on('call-record', async(info) => {
      console.warn('rtc.account.event', info);
      await createIncomingRecord(info);
      this.recordUpdate = Date.now();

      return true;
    });

    rtc.call.$on('call-record', async(info) => {
      console.warn('rtc.call.event', info);

      if (!info.isCall) return;

      let record = await callRecordDB.getRecordById(info.id);

      if (!record) record = await createCallRecord(info);

      if (info.direction) record.type = info.direction === 'outgoing' ? 'callout' : 'incoming';

      if (info.status === 'confirmed') {
        record.connected = true;
      }

      else if (info.status === 'failed') {
        record.connected = false;
      }

      else if (info.status === 'finished') {
        if (record.direction === 'incoming') record.connected = true;

        if (record.connected) record.endTime = Date.now();
      }
      if (info.pin) record.pin = info.pin;
      // console.warn(record);
      await callRecordDB.updateRecord('id', info.id, record);
      this.recordUpdate = Date.now();
    });

    rtc.conference.$on('call-record', async(info) => {
      console.warn('rtc.conference.event', info);
      let record = await callRecordDB.getRecordById(info.id);

      if (!record) record = await createConferenceRecord(info);

      if (info.subject) record.subject = info.subject;

      if (info.status === 'connected') {
        record.connected = true;
      }

      if (info.status === 'disconnected' && record.connected) {
        record.endTime = Date.now();
      }

      if (info.pin) record.pin = info.pin;

      await callRecordDB.updateRecord('id', info.id, record);
      this.recordUpdate = Date.now();
    });
  },
});

export default model;

async function createConferenceRecord(info) {
  const { account, server } = storage.query('CURRENT_ACCOUNT');
  const params = {
    subject          : info.subject,
    type             : 'callout',
    direction        : 'outgoing',
    connected        : false,
    media            : 'video',
    id               : info.id,
    startTime        : Date.now(),
    endTime          : null,
    otherId          : info.number,
    isConference     : true,
    conferenceNumber : info.number,
    pin              : info.pin,
    account,
    server,
    other            : {
      name : '',
    },
  };

  await callRecordDB.add('records', params);

  return params;
}

async function createCallRecord(info) {
  const { account, server } = storage.query('CURRENT_ACCOUNT');
  const params = {
    subject      : info.target,
    type         : info.direction === 'incoming' ? 'incoming' : 'callout',
    direction    : info.direction,
    connected    : false,
    media        : 'video',
    id           : info.id,
    startTime    : Date.now(),
    endTime      : null,
    otherId      : info.target,
    isConference : false,
    account,
    server,
    other        : {
      name : info.target,
    },
  };

  await callRecordDB.add('records', params);

  return params;
}

async function createIncomingRecord(info) {
  const { account, server } = storage.query('CURRENT_ACCOUNT');
  const params = {
    subject      : info.remoteIdentity._display_name,
    type         : info.direction,
    direction    : info.direction,
    connected    : false,
    media        : 'video',
    id           : info.id,
    startTime    : Date.now(),
    endTime      : null,
    otherId      : info.remoteIdentity._display_name,
    isConference : !!(info.focusUri && info.entity),
    pin          : info.pin,
    account,
    server,
    other        : {
      name : info.remoteIdentity._display_name,
    },
  };

  await callRecordDB.add('records', params);

  return params;
}
