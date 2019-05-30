import moment from 'moment';
import { $t } from '../../../i18n';

const CONF_PROFILE = {
  MEETING    : 0, // 会议模式
  TEACHING   : 1, // 授课模式
  CONFERENCE : 2, //  '研讨会模式',
};

// 当前会议预约操作仅支持预约0,1,2 三种类型的周期会议
const RECU_TYPE = {
  RECURS_DAILY     : 0,
  RECURS_WEEKLY    : 1,
  RECURS_MONTHLY   : 2,
  RECURS_MONTH_NTH : 3,
  RECURS_YEARLY    : 4,
  RECURS_YEAR_NTH  : 5,
};

// 当前预约操作仅支持按每X天循环的类型。
const DAILY_TYPE = {
  EVERY_NTH_DAY : 1, // 每几天
  EVERY_WORKDAY : 2, // 每个工作日
};

// const WEEK_INDEX = {
//   FIRST  : 1, // 第一个
//   SECOND : 2, // 第二个
//   THIRD  : 3, // 第三个
//   FOURTH : 4, // 第四个
//   LAST   : -1, // 最后一个
// };

const WEEK_INDEX = [
  '',
  'schedule.info.first',
  'schedule.info.second',
  'schedule.info.third',
  'schedule.info.fourth',
];

const RANGE_TYPE = {
  NO_END         : 1, // 无结束日期
  END_AFTER_RECU : 2, // 重复几次后结束
  END_AFTER_DATE : 3, // 在具体日期后结束
};

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

const WEEK_MAP = [
  '',
  'schedule.info.sunday',
  'schedule.info.monday',
  'schedule.info.tuesday',
  'schedule.info.wednesday',
  'schedule.info.thursday',
  'schedule.info.friday',
  'schedule.info.saturday' ];

const genPattern = (
  {
    recurrenceType,
    dailyType,
    recurrenceInterval,
    dayOfWeek,
    dayOfMonth,
    dayOfWeekIndex,
    monthOfYear,
    rangeStartDate,
    rangeEndDate,
    rangeType,
    rangeOccurrences,
  }
) => {
  let title = '';

  monthOfYear += 1;

  const interval = recurrenceInterval === 1 ? '' : recurrenceInterval;

  switch (recurrenceType) {
    case RECU_TYPE.RECURS_DAILY:
      if (dailyType === DAILY_TYPE.EVERY_NTH_DAY) title = '每个工作日发生';
      else title = $t('schedule.format.recursDaily', { interval });// `每${interval}天发生`;
      break;
    case RECU_TYPE.RECURS_WEEKLY: {
      const daysOfWeek = dayOfWeek.split(',').map((_) => $t(WEEK_MAP[_])).join(',');

      title = $t('schedule.format.recursWeekly', { interval, daysOfWeek });
    } break;
    case RECU_TYPE.RECURS_MONTHLY:
      title = $t('schedule.format.recursMonthly', { interval, dayOfMonth });
      break;
    case RECU_TYPE.RECURS_MONTH_NTH: {
      const daysOfWeek = $t(dayOfWeekIndex > 0 ? WEEK_INDEX[dayOfWeekIndex] : 'schedule.format.last') + $t(WEEK_MAP[dayOfWeek]);

      title = $t('schedule.format.recursMonthNth', { interval, dayOfWeek: daysOfWeek });
    } break;
    case RECU_TYPE.RECURS_YEARLY: {
      const _monthOfYear = $t(MONTH_LIST[monthOfYear]);

      title = $t('schedule.format.recursYearly', { interval, monthOfYear: _monthOfYear, dayOfMonth });
    } break;
    case RECU_TYPE.RECURS_YEAR_NTH: {
      const _monthOfYear = $t(MONTH_LIST[monthOfYear]);
      const daysOfWeek = $t(dayOfWeekIndex > 0 ? WEEK_INDEX[dayOfWeekIndex] : 'schedule.format.last') + $t(WEEK_MAP[dayOfWeek]);

      title = $t('recursYearlyNth', { interval, monthOfYear: _monthOfYear, daysOfWeek });
    } break;
    default: break;
  }
  
  return { title };
};

const genMeetingStatus = (startTime, expiryTime, remindEarly = 5 * 60 * 1000) => {
  const currentTime = new Date().getTime();

  startTime = new Date(startTime).getTime();
  expiryTime = new Date(expiryTime).getTime();

  const isPrepared = currentTime < startTime;
  const isEnded = currentTime >= expiryTime;
  const isReady = !isEnded && ((startTime - currentTime) - remindEarly) <= 0; // 正在进行中或者可以提前开始
  const isRunning = !isPrepared && !isEnded;

  return { isPrepared, isEnded, isRunning, isReady };
};

export function formatSchedule(data) {
  if (!data) return null;

  const schedules = [];

  data.forEach((schedule) => {
    if (!schedule.startDateTime) return;
    // const schedule = Object.create(plan);

    schedule.startMoment = moment(schedule.startDateTime);
    schedule.startTime = schedule.startMoment.format('YYYY/MM/DD HH:mm');
    schedule.expiryMoment = moment(schedule.endDateTime);
    schedule.expiryTime = schedule.expiryMoment.format('YYYY/MM/DD HH:mm');

    schedule.updateStatus = function() {
      this.status = genMeetingStatus(this.startTime, this.expiryTime, this.aheadTime);
    };
    schedule.updateStatus();


    schedule.isLive = !!schedule.isRTMP;

    const { recurrenceType } = schedule;

    schedule.isRecurrence = recurrenceType != null;
    schedule.scheduleId = schedule.planId; // TODO for yms

    if (recurrenceType) {
      schedule.pattern = genPattern(schedule);
    }

    schedules.push(schedule);
  });

  return schedules;
}
