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
      currentDateEvents : {},
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
