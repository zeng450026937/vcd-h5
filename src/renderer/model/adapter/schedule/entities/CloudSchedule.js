import Schedule from './Schedule';

export default class CloudSchedule extends Schedule {
  constructor(schedule) {
    super();
    schedule = this.formatSchedule(schedule);
    this._init(schedule);
  }

  get profile() { return this.schedule.profile; }

  get sequence() { return this.schedule.sequence; }

  get timeZoneConfig() { return this.schedule.timeZoneConfig; }

  formatSchedule(schedule) {
    return schedule;
  }

  setDetails(details) {
    this.hasDetails = true; // 下发日程更新时间的时候重置为false
    Object.assign(this.schedule, details);
    this.schedule.participants.push(details.organizer);
  }
}
