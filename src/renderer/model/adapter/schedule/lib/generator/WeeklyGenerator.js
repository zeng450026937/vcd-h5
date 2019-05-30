/** *
 * author:1494
 * date:2019/4/2
 * description:
 * use：
 */
import BaseGenerator from './BaseGenerator';
import DayOfWeekType from '../model/DayOfWeekType';

class WeeklyGenerator extends BaseGenerator {
  constructor(plan) {
    super(plan);
  }

  /** *
   * ConferenceTime 执行周期会议序列生成操作
   * @returns {Array}
   */

  doGenerate() {
    const dayOfWeeks = new Set(this.plan.dayOfWeek.split(','));

    while (this.continueEnable()) {
      const weekday = this.current.weekday();

      if (dayOfWeeks.has((weekday + 1).toString())) {
        this.createConference();
      }
      else if (!this.list.length) {
        this.createConference();
      }
      // weekday in moment rules
      if (weekday === DayOfWeekType.SATURDAY && this.plan.recurrenceInterval > 1) {
        this.current.add(this.plan.recurrenceInterval - 1, 'weeks');
      }
      this.addInterval();
    }
    
    return this.list;
  }
}

export default WeeklyGenerator;
