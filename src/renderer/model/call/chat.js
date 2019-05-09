import moment from 'moment';
import rtc from '../../rtc';
import Vuem from '../vuem';
import { $t } from '../../i18n';

const chat = new Vuem();

chat.provide({
  data() {
    return {
      messageRecordList : [], // 2000 条
      hasNewMessage     : false,
    };
  },
  computed : {
    currentTab() {
      return this.$parent.sketch.currentTab;
    },
    newMessage() {
      return rtc.account.newMessage;
    },
    isConnected() {
      return rtc.call.connected;
    },
  },
  methods : {
    sendMessage(from, to, content, type) {
      const startTime = moment(new Date(), 'YYYYMMDD').format('HH:mm');
      const messageObject = {
        from,
        to,
        content,
        date      : startTime,
        type,
        isPrivate : true,
      };

      rtc.account.sendMessage(to, content);
      this.messageRecordList.push(messageObject);
    },
  },
  watch : {
    newMessage(val) {
      if (this.currentTab !== 'TabChatting') {
        this.hasNewMessage = true;
      }
      const raw = val[val.length - 1];

      const messageObject = {
        from      : raw.remote_identity.uri.user,
        to        : $t('conversation.chat.me'),
        content   : raw._request.body,
        date      : moment(new Date(), 'YYYYMMDD').format('HH:mm'),
        isPrivate : true,
        type      : 'receive',
      };

      this.messageRecordList.push(messageObject);
    },
    isConnected() {
      this.messageRecordList = [];
    },
    messageRecordList(val) {
      if (val.length > 2100) {
        this.messageRecordList = this.messageRecordList.slice(val.length - 2000);
      }
    },
  },
});

export default chat;
