import moment from 'moment';
import 'moment/locale/zh-cn';
import { camelize } from '../../lib/string-transform';

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

const genMeetingStatus = (startTime, expiryTime, remindEarly) => {
  const currentTime = new Date().getTime();

  startTime = new Date(startTime).getTime();
  expiryTime = new Date(expiryTime).getTime();

  const isPrepared = currentTime < startTime;
  const isEnded = currentTime >= expiryTime;
  const isReady = ((startTime - currentTime) - (remindEarly || 5) * 60 * 1000) <= 0; // 正在进行中或者可以提前开始
  const isRunning = !isPrepared && !isEnded;

  return { isPrepared, isEnded, isRunning, isReady };
};

export function formatCalendar(data) {
  if (!data) return null;

  const calendars = [];
  // const titles = [];

  data.forEach((cal) => {
    if (!cal['start-time']) return;

    cal.startMoment = moment(cal['start-time']);
    cal.startTime = cal.startMoment.format('YYYY-MM-DD HH:mm');
    cal.expiryMoment = moment(cal['expiry-time']);
    cal.expiryTime = cal.expiryMoment.format('YYYY-MM-DD HH:mm');

    cal.status = genMeetingStatus(cal.startTime, cal.expiryTime, cal['remind-early']);
    const plainCalendar = {};

    Object.keys(cal).forEach((key) => {
      plainCalendar[camelize(key)] = cal[key];
    });


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
      if (plainCalendar.isRecurrence) {
        plainCalendar.pattern = genPattern(type, recurrencePattern);
      }
      Reflect.deleteProperty(plainCalendar, 'recurrencePattern'); // for save memory
    }

    // 排序参会成员
    const { invitee } = plainCalendar.invitees;
    // AL 1
    // const tmpInvitee = [];
    //
    // invitee.forEach((c) => {
    //   if (c.role === 'organizer') {
    //     tmpInvitee.unshift(c);
    //   }
    //   else {
    //     tmpInvitee.push(c);
    //   }
    // });
    // invitee.length = 0;
    // invitee.push(...tmpInvitee);

    // AL 2
    let cursor = 0;

    invitee.forEach((c, index) => {
      if (c.role === 'organizer') {
        if (index !== cursor) {
          const tmp = invitee[cursor];

          invitee[cursor] = invitee[index];
          invitee[index] = tmp;
        }
        cursor += 1;
      }
    });
    calendars.push(plainCalendar);
  });

  return calendars;
}
