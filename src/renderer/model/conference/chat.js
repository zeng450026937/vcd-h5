import moment from 'moment';
import Vuem from '../vuem';
import rtc from '../../rtc';
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
    isOnHold() {
      return this.$parent.currentUser.isOnHold();
    },
    newMessage() {
      return rtc.conference.message;
    },
    isConnected() {
      return rtc.conference.connected;
    },
  },
  methods : {
    sendMessage(from, target, content, type) {
      const { conference } = rtc.conference;
      const startTime = moment(new Date(), 'YYYYMMDD').format('HH:mm');
      const messageObject = {
        toAll : target === 'all',
        from  : {
          entity      : '',
          displayText : from,
        },
        content,
        date      : startTime,
        type,
        isPrivate : true,
      };

      if (target === 'all') {
        conference.sendMessage(content);
        messageObject.to = {
          entity      : '',
          displayText : $t('conversation.chat.all'),
        };
      }
      else {
        const user = conference.users.getUser(target);

        conference.sendMessage(content, [ user.entity ]);
        messageObject.to = {
          entity      : user.entity,
          displayText : user.displayText,
        };
      }

      this.messageRecordList.push(messageObject);
    },
  },
  watch : {
    newMessage(val) {
      if (this.isOnHold) return;
      if (this.currentTab !== 'TabChatting') {
        this.hasNewMessage = true;
      }
      console.warn(val);
      const messageObject = {
        from : {
          entity      : val.user['@entity'],
          displayText : val.user['@display-text'],
        },
        content : val.msg,
        date    : moment(new Date(), 'YYYYMMDD').format('HH:mm'),
        toAll   : !val['@is-private'],
        to      : {
          entity      : '',
          displayText : val['@is-private']
            ? $t('conversation.chat.me')
            : $t('conversation.chat.all'),
        },
        isPrivate : val['@is-private'],
        type      : 'receive',
      };

      this.messageRecordList.push(messageObject);
    },
    async isConnected(val) {
      const { conference } = rtc.conference;

      if (val && !conference.isChatAvariable()) {
        await conference.connectChat();
      }
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
