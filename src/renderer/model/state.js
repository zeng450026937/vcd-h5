import Vuem from './vuem';
import rtc from '../rtc';
import popup from '../popup';
import router from '../router';
import { CONFERENCE, CALL } from '../router/constants';
import storage from '../storage';
import { CallRecord } from '../database/call-record';
import { $t } from '../i18n';


const callRecordDB = CallRecord.Create();
const model = new Vuem();

model.provide({
  data() {
    return {
      loginPopup          : null, // 登录中的 popup 提示
      enterPopup          : null, // 正在进入会议的 popup 提示
      isInMiniConference  : false, // 记录当前页面是否在会议的小窗口
      isInMiniCall        : false, // 记录当前页面是否在P2P通话的小窗口
      currentConferenceId : null,
      recordUpdate        : null,
      scheduleEvents      : [],
      isOpenNotify        : false,
    };
  },
  computed : {
    // 登录状态 disconnected connecting registering registered disconnected
    loginStatus : () => rtc.account.status,
    isPreparing : {
      get() {
        return this.$parent.meeting.isPreparing;
      },
      set(val) {
        this.$parent.meeting.isPreparing = val;
      },
    },
    // 会议状态 isPreparing disconnected connecting connected disconnected
    confStatus() {
      const { status } = rtc.conference;

      return this.isPreparing ? 'connecting' : status;
    },
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
    currentContact() {
      return this.$parent.contact.currentContact;
    },
  },
  methods : {
    async handleLogin(val, once) {
      if (val === 'connecting' || val === 'registering') { // 正在登录状态
        if (!this.loginPopup || this.loginPopup._isDestroyed) {
          this.loginPopup = popup.prepared('loadingModal', { content: $t('login.tips.isLogin') }).display();
          this.loginPopup.vm.$once('cancel', () => {
            rtc.account.signout();
            popup.destroy(this.loginPopup);
          });
        }
      }
      else if (once && val === 'disconnected' && this.loginPopup) popup.destroy(this.loginPopup);
      // else if (this.loginPopup) popup.destroy(this.loginPopup);
    },
    handleEnterMeeting(val, once) {
      this.isPreparing = false;
      if (val === 'connecting') { // 正在入会状态
        if (!this.enterPopup || this.enterPopup._isDestroyed) {
          this.enterPopup = popup.prepared('loadingModal', { content: $t('join.title.connectMeeting') }).display();
          this.enterPopup.vm.$once('cancel', () => {
            rtc.conference.leave();
            popup.destroy(this.enterPopup);
          });
        }
      }
      else {
        if (val === 'connected') { // 入会成功
          router.push(CONFERENCE.CONFERENCE_MAIN);
          this.$dispatch('application.show');
        }
        else if (once === 'connected' && val === 'disconnected') { // 退出会议
          this.isInMiniConference = false;
        }
        if (this.enterPopup) popup.destroy(this.enterPopup);
      }
    },
    async handleCall(val, once) {
      if (val === 'ringing') { // 来电
        // 通话中免打扰
        if ((rtc.call.status === 'confirmed' || rtc.conference.connected)
          && this.$parent.setting.dndWhenCalling) {
          rtc.call.decline();

          return;
        }

        this.$dispatch('notify.notify', { type: 'ringing' }); // 打开右下角的小窗口
      }
      else if (val === 'connecting' || (once === 'ringing' && val === 'connected')) { // 拨号 或者 来电接通
        if (!this.isInMiniCall) { // Mini下挂断新的来电
          router.push(CALL.CALL_MAIN);
        }
        if (once === 'ringing' && val === 'connected') {
          this.$dispatch('application.show');
        }
      }
      else if (once && val === 'disconnected') {
        this.isInMiniCall = false;
      }
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
    currentContact(val) {
      if (!val || !val.number) return;
      if (this.loginPopup)popup.destroy(this.loginPopup);
    },
  },
  async created() {
    await this.$nextTick();


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

      else if (info.status === 'decline') {
        if (!record.connected) record.refuse = true;
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

  if (info.media == null || Object.keys(info.media).length === 0) info.media = { video: true };

  const params = {
    subject          : info.subject,
    type             : 'callout',
    direction        : 'outgoing',
    connected        : false,
    media            : info.media.video ? 'video' : 'audio',
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

  if (info.media == null) info.media = { video: true };

  const params = {
    subject      : info.target,
    type         : info.direction === 'incoming' ? 'incoming' : 'callout',
    direction    : info.direction,
    connected    : false,
    media        : info.media.video ? 'video' : 'audio',
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

  if (info.media == null) info.media = { video: true };
  const params = {
    subject          : info.remoteIdentity.uri._user,
    type             : info.direction,
    direction        : info.direction,
    conferenceNumber : info.remoteIdentity.uri._user,
    connected        : false,
    media            : info.media.video ? 'video' : 'audio',
    id               : info.id,
    startTime        : Date.now(),
    endTime          : null,
    otherId          : info.remoteIdentity.uri._user,
    isConference     : !!(info.focusUri && info.entity),
    pin              : info.pin,
    account,
    server,
    other            : {
      name : info.remoteIdentity._display_name,
    },
  };

  await callRecordDB.add('records', params);

  return params;
}
