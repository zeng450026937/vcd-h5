import moment from 'moment';
import 'moment/locale/zh-cn';
import rtc from '../../rtc';

const WEEK_MAP = {
  Monday    : '星期一',
  Tuesday   : '星期二',
  Wednesday : '星期三',
  Thursday  : '星期四',
  Friday    : '星期五',
  Saturday  : '星期六',
  Sunday    : '星期日',
};

const DAY_MAP = {
  Sunday     : '星期日',
  Monday     : '星期一',
  Tuesday    : '星期二',
  Wednesday  : '星期三',
  Thursday   : '星期四',
  Friday     : '星期五',
  Saturday   : '星期六',
  Day        : '日子',
  Weekday    : '工作日',
  WeekendDay : '周末',
};

const INDEX_MAP = [ '', '第一个', '第二个', '第三个', '第四个' ];

const MONTH_LIST = [ '', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十一' ];

export const lineToUppercase = (str) => {
  if (!str || str.indexOf('-') < 0) return str;

  return str.replace(/-\w+/g, (word) => word.substring(1, 2).toUpperCase() + word.substring(2));
};

const genPattern = (decurs, recurrencePattern) => {
  const interval = recurrencePattern['@interval'] === 1 ? '' : recurrencePattern['@interval'];

  let title;

  switch (decurs) {
    case 'RECURS_DAILY': {
      title = `每${interval}天发生`;
      break;
    }
    case 'RECURS_WEEKLY': {
      const daysOfWeek = recurrencePattern['@days-of-week'].split(',').map((_) => WEEK_MAP[_]).join(',');

      title = `每${interval}周的${daysOfWeek}发生`;
      break;
    }
    case 'RECURS_MONTHLY': {
      title = `每${interval}个月的第${recurrencePattern['@day-of-month']}天发生`;
      break;
    }
    case 'RECURS_MONTH_NTH': {
      const index = recurrencePattern['@day-of-week-index'];

      title = `每${interval}个月的${index > 0 ? INDEX_MAP[index] : '最后一个'}${DAY_MAP[recurrencePattern['@days-of-week']]}发生`;
      break;
    }
    case 'RECURS_YEARLY': {
      title = `每${interval}年的${MONTH_LIST[recurrencePattern['@month-of-year']]}月的第${recurrencePattern['@day-of-month']}天发生`;
      break;
    }
    case 'RECURS_YEAR_NTH': {
      const index = recurrencePattern['@day-of-week-index'];

      title = `每${interval}年的${MONTH_LIST[recurrencePattern['@month-of-year']]}月${index > 0 ? INDEX_MAP[index] : '最后一个'}${DAY_MAP[recurrencePattern['@days-of-week']]}发生`;
      break;
    }
    default: break;
  }

  let time;

  const hasNoEndDate = recurrencePattern['@has-no-end-date'];
  const occurrences = recurrencePattern['@occurrences'];
  const patternStartDate = recurrencePattern['@pattern-start-date'];
  const patternEndDate = recurrencePattern['@pattern-end-date'];
  const conferenceStartTime = recurrencePattern['@conference-start-time'];
  const conferenceEndTime = recurrencePattern['@conference-end-time'];

  if (hasNoEndDate) { // 无结束时间
    time = `${patternStartDate} 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
  }
  else if (occurrences > 0) {
    time = `${patternStartDate}，重复${occurrences}次后结束 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
  }
  else {
    time = `${patternStartDate} 至 ${patternEndDate} 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
  }
  
  return {
    title,
    time,
  };
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
      // RECURS_MONTHLY 每月的第一种, 每个月的第12天
      // RECURS_MONTH_NTH 每月的第二种,
      // RECURS_YEARLY每年的第一种,每年的10月份的第12天
      // RECURS_YEAR_NTH 每年的第二种每年的10月份的第一个星期天
      const { recurrencePattern } = plainCalendar;

      if (recurrencePattern) {
        const type = recurrencePattern['@recurrence-type'];

        plainCalendar.isRecurrence = type && type !== 'RECURS_ONCE';
        plainCalendar.pattern = genPattern(type, recurrencePattern);
        Reflect.deleteProperty(plainCalendar, 'recurrencePattern'); // for save memory
      }
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
