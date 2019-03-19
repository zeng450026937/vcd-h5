import Vuem from '../vuem';
import moment from 'moment';
import rtc from '../../rtc';

const chat = new Vuem();

chat.provide({
  data() {
    return {
      messageRecordList : [], // 2000 条
      hasNewMessage     : false,
    };
  },
  computed : {
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
        from,
        content,
        date      : startTime,
        type,
        isPrivate : true,
      };

      if (target === 'all') {
        conference.sendMessage(content);
        messageObject.to = '所有人';
      }
      else {
        const user = conference.users.getUser(target);

        conference.sendMessage(content, [ user.entity ]);
        messageObject.to = user.displayText;
      }

      this.messageRecordList.push(messageObject);
    },
  },
  watch : {
    newMessage(val) {
      this.hasNewMessage = true;
      const messageObject = {
        from      : val.user['@display-text'],
        content   : val.msg,
        date      : moment(new Date(), 'YYYYMMDD').format('HH:mm'),
        to        : val['@is-private'] ? '我' : '所有人',
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
    },
    messageRecordList(val) {
      if (val.length > 2100) {
        this.messageRecordList = this.messageRecordList.slice(val.length - 2000);
      }
    },
  },
});

export default chat;
