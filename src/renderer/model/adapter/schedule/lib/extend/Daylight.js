import moment from "moment";

export default class Daylight {

  static filterDaylightDate(plan) {
    const startValue = plan.startDateTime;
    const config = plan.timeZoneConfig.rule.find(x => Daylight.getDateValue(x.dateStart, plan.timeZoneConfig.offsetDisplayName) < startValue
      && Daylight.getDateValue(x.dateEnd, plan.timeZoneConfig.offsetDisplayName) > startValue);
    if (config) {
      const startTime = moment(plan.startDateTime);
      const year = startTime.year();
      const daylightStrategyStart = Daylight.getDaylightStrategy(config.daylightStrategyStart, year);
      const daylightStrategyEnd = Daylight.getDaylightStrategy(config.daylightStrategyEnd, year);
      if (daylightStrategyStart.isBefore(startTime) && startTime.isBefore(daylightStrategyEnd)) {
        const daylightDeltaSplit = config.daylightDelta.split(':').map(Number);
        const duration = (daylightDeltaSplit[0] * 60 * 60 + daylightDeltaSplit[1] * 60 + daylightDeltaSplit[2]) * 1000;
        plan.startDateTime -= duration;
        plan.endDateTime -= duration;
      }
    }
  }

  static getDaylightStrategy({month, day, timeOfDay}, year) {
    return moment(`${year}-${month}-${day}${timeOfDay.replace('0001-01-01', '')}`);
  }

  static getDateValue(date, offsetDisplayName) {
    return moment(date + offsetDisplayName).valueOf();//moment(date).utcOffset(offsetDisplayName).valueOf();
  }
}