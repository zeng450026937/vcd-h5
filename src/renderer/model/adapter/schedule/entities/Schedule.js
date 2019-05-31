import uuid from 'uuid';
import { formatSchedule } from '../format';

export default class Schedule {
  constructor() {
    this.schedule = {};
  }

  _init(schedule) {
    this.schedule = schedule;
    this.updateStatus();
    this.uuid = uuid.v1();
    // for vue
    this.schedule.participants = this.schedule.participants || [];
    this.schedule.organizer = this.schedule.organizer || {};
    this.pattern = {};
  }

  get planId() { return this.schedule.planId; }

  get number() { return this.schedule.conferenceNo; }

  get password() { return this.schedule.conferencePwd; }

  get subject() { return this.schedule.subject; }

  get roomNames() { return this.schedule.roomNames; }

  get remark() { return this.schedule.remark; }

  get organizerName() { return this.schedule.organizerName; }

  // 仅仅当前会议的开始结束时间
  get startTime() { return this.schedule.startDateTime; }

  get endTime() { return this.schedule.endDateTime; }

  get aheadTime() { return this.schedule.aheadTime || 5 * 60 * 1000; }

  get isRecurrence() { return this.schedule.recurrenceType != null; }

  get isRTMP() { return this.schedule.isRTMP; }

  get organizer() { return this.schedule.organizer; }

  get participants() { return this.schedule.participants || []; }

  get recurrence() {
    if (!this.isRecurrence) return null;

    const { dayOfWeek } = this.schedule;
    
    return {
      type           : this.schedule.recurrenceType,
      dailyType      : this.schedule.dailyType,
      interval       : this.schedule.recurrenceInterval,
      dayOfWeek      : Array.isArray(dayOfWeek) ? dayOfWeek : [ dayOfWeek ] ,
      dayOfMonth     : this.schedule.dayOfMonth,
      dayOfWeekIndex : this.schedule.dayOfWeekIndex,
      monthOfYear    : this.schedule.monthOfYear,
      // 周期会议范围(总时长)
      rangeStartDate : this.schedule.rangeStartDate,
      rangeEndDate   : this.schedule.rangeEndDate,
      // 当前次会议范围
      startTime      : this.startTime,
      endTime        : this.endTime,
      rangeType      : this.schedule.rangeType,
      occurrences    : this.schedule.rangeOccurrences,
    };
  }

  updateStatus() {
    const now = Date.now();
    const isPrepared = now < this.startTime;
    const isEnded = now >= this.endTime;
    const isReady = !isEnded && ((this.startTime - now) - this.aheadTime) <= 0; // 正在进行中或者可以提前开始
    const isRunning = !isPrepared && !isEnded;

    this.status = {
      isEnded,
      isReady,
      isRunning,
      isPrepared,
    };
  }

  // 用户查看详情的时候手动去调用
  genRecurrence(force = false) {
    if (!this.isRecurrence && this.pattern.title && !force) return;
    this.pattern = formatSchedule(this.recurrence);
  }

  getScheduleInfo() {}
}
