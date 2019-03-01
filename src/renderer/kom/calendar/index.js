import moment from 'moment';
import 'moment/locale/zh-cn';
import rtc from '../../rtc';

export const lineToUppercase = (str) => {
  if (!str || str.indexOf('-') < 0) return str;

  return str.replace(/-\w+/g, (word) => word.substring(1, 2).toUpperCase() + word.substring(2));
};

export const formatCalendar = (data) => {
  if (!data) return null;

  const calendars = [];
  const titles = [];

  data.forEach((cal) => {
    if (!cal['start-time']) return;

    const startTime = moment(new Date(`${cal['start-time']} GMT`), 'YYYYMMDD');
    const title = startTime.format('LL');

    cal['start-time'] = startTime.format('YYYY-MM-DD HH:mm');
    cal['expiry-time'] = moment(new Date(`${cal['expiry-time']} GMT`)).format('YYYY-MM-DD HH:mm');

    const plainCalendar = {};

    Object.keys(cal).forEach((key) => {
      if ([ '@', '-', '_' ].some((r) => key.startsWith(r))) return;

      plainCalendar[lineToUppercase(key)] = cal[key];
      plainCalendar.isLive = !!plainCalendar.rtmpInvitees;
      if (plainCalendar.isLive) {
        // 添加直播地址
        plainCalendar.liveShareUrl = plainCalendar.rtmpInvitees['rtmp-invitee'][0].session[0]['web-share-url'];
      }
      // RECURS_DAILY每天,
      // RECURS_WEEKLY每周,
      // RECURS_MONTHLY每月的第一种,
      // 个月的第12天RECURS_MONTH_NTH每月的第二种,
      // RECURS_YEARLY每年的第一种
      // 每年的10月份的第12天RECURS_YEAR_NTH
      // 每年的第二种每年的10月份的第一个星期天
      const type = plainCalendar.recurrencePattern && plainCalendar.recurrencePattern['@recurrence-type'];

      plainCalendar.isRecurrence = type && type !== 'RECURS_ONCE';
    });

    if (!titles.includes(title)) {
      titles.push(title);
      calendars.push({
        title,
        startTime,
        events : [ plainCalendar ],
      });
    }
    else {
      calendars.find((item) => item.title === title).events.push(plainCalendar);
    }
  });

  return calendars;
};

export default {
  data() {
    return {
      formatCalendar    : null,
      currentDateEvents : [],
      currentEvent      : {},
    };
  },
  computed : {
    rawCalendars() {
      return rtc.account.schedule.list;
    },
    ua() {
      return rtc.account.ua;
    },
  },
  watch : {
    rawCalendars(val) {
      this.formatCalendar = formatCalendar(val);
    },
    ua() {
      this.formatCalendar = null;
    },
  },
};
