import moment from 'moment';
import Schedule from './Schedule';

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

const WEEK_MAP = {
  Sunday    : 1,
  Monday    : 2,
  Tuesday   : 3,
  Wednesday : 4,
  Thursday  : 5,
  Friday    : 6,
  Saturday  : 7,
};

export default class YmsSchedule extends Schedule {
  constructor(schedule) {
    super();
    schedule = this.formatSchedule(schedule);
    this._init(schedule);
  }

  formatSchedule(schedule) {
    const planId = schedule['@plan-id'];

    schedule = schedule['conference-description'];

    const options = {
      planId,
      conferenceNo  : schedule['conference-number'],
      conferencePwd : schedule['attendee-pin'],
      subject       : schedule.subject,
      roomNames     : schedule.locations,
      remark        : schedule.note,
      organizer     : {
        identifier : schedule.organizer.uid,
        role       : 0,
        type       : !schedule.organizer.domain ? 0 : 1, // 0：内部参会者，1：外部参会者
        showName   : schedule.organizer['display-text'],
        extension  : schedule.organizer.phone,
      },
      // 会议时间
      startDateTime : new Date(`${schedule['start-time']} GMT`).getTime(),
      endDateTime   : new Date(`${schedule['expiry-time']} GMT`).getTime(),
      aheadTime     : (schedule['create-early'] || 5) * 60 * 1000,
    };

    // RTMP
    const isRTMP = !!schedule.rtmpInvitees;

    if (isRTMP) {
      options.isRTMP = isRTMP;
      options.rtmpUrl = schedule.rtmpInvitees['rtmp-invitee'][0].session[0]['web-share-url'];
    }

    const participants = this.formatParticipants(schedule.invitees.invitee);

    return Object.assign(options, this.formatRecurrence(schedule['recurrence-pattern']), { participants });
  }

  formatRecurrence(pattern) {
    const type = pattern['@recurrence-type'];
    const isRecurrence = type && type !== 'RECURS_ONCE';

    if (!isRecurrence) return {};

    return {
      recurrenceType : RECU_TYPE[type],
      dailyType      : DAILY_TYPE.EVERY_NTH_DAY,
      interval       : pattern['@interval'],
      dayOfWeek      : pattern['@days-of-week'].split(',').map((w) => WEEK_MAP[w]), // 返回数组
      dayOfMonth     : pattern['@day-of-month'],
      dayOfWeekIndex : pattern['@day-of-week-index'],
      monthOfYear    : pattern['@month-of-year'],
      // 当前会议时间区间（一个周期会议有多个子会议）
      rangeStartDate : new Date(`${pattern['@pattern-start-date']}`).getTime(),
      rangeEndDate   : new Date(`${pattern['@pattern-end-date']}`).getTime(),
      rangeType      : pattern['@has-no-end-date'] ? 1 : pattern['@occurrences'] ? 2 : 3,
      occurrences    : pattern['@occurrences'],
    };
  }

  // 生成参会成员列表
  formatParticipants(invitees) {
    if (!Array.isArray(invitees)) return;

    const participants = invitees.map((invitee) => ({
      identifier : invitee.uid,
      role       : invitee.role === 'organizer' ? 0 : invitee.role === 'attendee' ? 2 : 1, // 目前没有观众 3,
      type       : !invitee.domain ? 0 : 1, // 0：内部参会者，1：外部参会者
      showName   : invitee['display-text'],
      extension  : invitee.phone,
    }));


    return participants;
  }
}
