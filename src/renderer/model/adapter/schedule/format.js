import moment from 'moment';
import { $t } from '../../../i18n';

export const CONF_PROFILE = {
  MEETING    : 0, // 会议模式
  TEACHING   : 1, // 授课模式
  CONFERENCE : 2, //  '研讨会模式',
};

// 当前会议预约操作仅支持预约0,1,2 三种类型的周期会议
export const RECU_TYPE = {
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


const genPattern = ({
  type,
  dailyType,
  interval,
  dayOfWeek,
  dayOfMonth,
  dayOfWeekIndex,
  monthOfYear,
  startTime,
  endTime,
  rangeStartDate,
  rangeEndDate,
  rangeType,
  occurrences,
}) => {
  let title = '';

  monthOfYear += 1;

  interval = interval === 1 ? '' : interval;

  switch (type) {
    case RECU_TYPE.RECURS_DAILY:
      if (dailyType === DAILY_TYPE.EVERY_NTH_DAY) title = '每个工作日发生';
      else title = $t('schedule.format.recursDaily', { interval });// `每${interval}天发生`;
      break;
    case RECU_TYPE.RECURS_WEEKLY: {
      const _dayOfWeek = dayOfWeek.map((_) => $t(WEEK_MAP[_])).join(',');

      title = $t('schedule.format.recursWeekly', { interval, dayOfWeek: _dayOfWeek });
    } break;
    case RECU_TYPE.RECURS_MONTHLY:
      title = $t('schedule.format.recursMonthly', { interval, dayOfMonth });
      break;
    case RECU_TYPE.RECURS_MONTH_NTH: {
      const _dayOfWeek = $t(dayOfWeekIndex > 0 ? WEEK_INDEX[dayOfWeekIndex] : 'schedule.format.last') + $t(WEEK_MAP[dayOfWeek[0]]);

      title = $t('schedule.format.recursMonthNth', { interval, dayOfWeek: _dayOfWeek });
    } break;
    case RECU_TYPE.RECURS_YEARLY: {
      const _monthOfYear = $t(MONTH_LIST[monthOfYear]);

      title = $t('schedule.format.recursYearly', { interval, monthOfYear: _monthOfYear, dayOfMonth });
    } break;
    case RECU_TYPE.RECURS_YEAR_NTH: {
      const _monthOfYear = $t(MONTH_LIST[monthOfYear]);
      const _dayOfWeek = $t(dayOfWeekIndex > 0 ? WEEK_INDEX[dayOfWeekIndex] : 'schedule.format.last') + $t(WEEK_MAP[dayOfWeek[0]]);

      title = $t('recursYearlyNth', { interval, monthOfYear: _monthOfYear, dayOfWeek: _dayOfWeek });
    } break;
    default: break;
  }

  let time;

  startTime = moment(startTime).format('HH:mm');
  endTime = moment(endTime).format('HH:mm');
  rangeStartDate = moment(rangeStartDate).format('YYYY/MM/DD');
  rangeEndDate = moment(rangeEndDate).format('YYYY/MM/DD');

  switch (rangeType) {
    case RANGE_TYPE.NO_END:
      time = $t('schedule.format.fromTo',
        {
          start : rangeStartDate,
          from  : startTime,
          to    : endTime,
        });
      break; // 没有结束日期
    case RANGE_TYPE.END_AFTER_RECU:
      time = $t('schedule.format.repeatFromTo',
        {
          start : rangeStartDate,
          occurrences,
          from  : startTime,
          to    : endTime,
        });
      break; // 重复一定次数后结束
    case RANGE_TYPE.END_AFTER_DATE:
      time = $t('schedule.format.toFromTo',
        {
          start : rangeStartDate,
          end   : rangeEndDate,
          from  : startTime,
          to    : endTime,
        });
      break; // 在固定的日期结束
    default: break;
  }
  
  return { title, time };
};

export function formatSchedule(recurrence) {
  if (!recurrence) return {};

  return genPattern(recurrence);
}
