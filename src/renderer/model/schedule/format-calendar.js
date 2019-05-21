import moment from 'moment';
import 'moment/locale/zh-cn';
import { camelize } from '../../lib/string-transform';
import { $t } from '../../i18n';

const WEEK_MAP = {
  Monday    : 'schedule.info.monday',
  Tuesday   : 'schedule.info.tuesday',
  Wednesday : 'schedule.info.wednesday',
  Thursday  : 'schedule.info.thursday',
  Friday    : 'schedule.info.friday',
  Saturday  : 'schedule.info.saturday',
  Sunday    : 'schedule.info.sunday',
};

const DAY_MAP = {
  Sunday     : 'schedule.info.sunday',
  Monday     : 'schedule.info.monday',
  Tuesday    : 'schedule.info.tuesday',
  Wednesday  : 'schedule.info.wednesday',
  Thursday   : 'schedule.info.thursday',
  Friday     : 'schedule.info.friday',
  Saturday   : 'schedule.info.saturday',
  Day        : 'schedule.info.day',
  Weekday    : 'schedule.info.weekday',
  WeekendDay : 'schedule.info.weekendDay',
};

const INDEX_MAP = [
  '',
  'schedule.info.first',
  'schedule.info.second',
  'schedule.info.third',
  'schedule.info.fourth',
];

const MONTH_LIST = [
  '',
  'schedule.info.one',
  'schedule.info.two',
  'schedule.info.three',
  'schedule.info.four',
  'schedule.info.five',
  'schedule.info.six',
  'schedule.info.seven',
  'schedule.info.eight',
  'schedule.info.nine',
  'schedule.info.ten',
  'schedule.info.eleven',
  'schedule.info.twelve',
];

const genPattern = (decurs, recurrencePattern) => {
  const interval = recurrencePattern['@interval'] === 1 ? '' : recurrencePattern['@interval'];

  let title;

  switch (decurs) {
    case 'RECURS_DAILY': {
      title = $t('schedule.format.recursDaily', { interval });// `每${interval}天发生`;
      break;
    }
    case 'RECURS_WEEKLY': {
      const daysOfWeek = recurrencePattern['@days-of-week'].split(',').map((_) => $t(WEEK_MAP[_])).join(',');

      title = $t('schedule.format.recursWeekly', { interval, daysOfWeek });
      break;
    }
    case 'RECURS_MONTHLY': {
      title = $t('schedule.format.recursMonthly', { interval, dayOfMonth: recurrencePattern['@day-of-month'] });
      break;
    }
    case 'RECURS_MONTH_NTH': {
      const index = recurrencePattern['@day-of-week-index'];

      const dayOfWeek = $t(index > 0 ? INDEX_MAP[index] : 'schedule.format.last') + $t(DAY_MAP[recurrencePattern['@days-of-week']]);

      title = $t('schedule.format.recursMonthNth', { interval, dayOfWeek });
      break;
    }
    case 'RECURS_YEARLY': {
      const monthOfYear = $t(MONTH_LIST[recurrencePattern['@month-of-year']]);
      const dayOfMonth = recurrencePattern['@day-of-month'];

      title = $t('schedule.format.recursYearly', { interval, monthOfYear, dayOfMonth });
      break;
    }
    case 'RECURS_YEAR_NTH': {
      const index = recurrencePattern['@day-of-week-index'];
      const monthOfYear = $t(MONTH_LIST[recurrencePattern['@month-of-year']]);
      const daysOfWeek = $t(index > 0 ? INDEX_MAP[index] : 'schedule.format.last') + $t(DAY_MAP[recurrencePattern['@days-of-week']]);

      title = $t('recursYearlyNth', { interval, monthOfYear, daysOfWeek });
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
    time = $t('schedule.format.fromTo',
      {
        start : patternStartDate,
        from  : conferenceStartTime,
        to    : conferenceEndTime,
      });

    // time = `${patternStartDate} 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
  }
  else if (occurrences > 0) {
    // time = `${patternStartDate}，重复${occurrences}次后结束 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
    time = $t('schedule.format.repeatFromTo',
      {
        start : patternStartDate,
        occurrences,
        from  : conferenceStartTime,
        to    : conferenceEndTime,
      });
  }
  else {
    // time = `${patternStartDate} 至 ${patternEndDate} 从 ${conferenceStartTime} 至 ${conferenceEndTime}`;
    time = $t('schedule.format.toFromTo',
      {
        start : patternStartDate,
        end   : patternEndDate,
        from  : conferenceStartTime,
        to    : conferenceEndTime,
      });
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
  const isReady = !isEnded && ((startTime - currentTime) - (remindEarly || 5) * 60 * 1000) <= 0; // 正在进行中或者可以提前开始
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
    cal.startTime = cal.startMoment.format('YYYY/MM/DD HH:mm');
    cal.expiryMoment = moment(cal['expiry-time']);
    cal.expiryTime = cal.expiryMoment.format('YYYY/MM/DD HH:mm');

    cal.updateStatus = function() {
      this.status = genMeetingStatus(this.startTime,
        this.expiryTime,
        this.createEarly || this['create-early']);
    };
    cal.updateStatus();

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
