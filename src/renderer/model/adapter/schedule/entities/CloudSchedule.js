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

  genDetails() {
    this.genRecurrence();
    // 获取详情
    
  }
}
