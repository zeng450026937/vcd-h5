import moment from 'moment';
import rtc from '../../rtc';

const messageRecordList = []; // max 2000 加载更多

export default {
  data() {
    return {
      messageRecordList,
    };
  },
  computed : {
    newMessage() {
      return rtc.account.newMessage;
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
      const raw = val[val.length - 1];

      const messageObject = {
        from      : raw.remote_identity.uri.user,
        to        : '我',
        content   : raw._request.body,
        date      : moment(new Date(), 'YYYYMMDD').format('HH:mm'),
        isPrivate : true,
        type      : 'receive',
      };

      this.messageRecordList.push(messageObject);
    },
  },
};
