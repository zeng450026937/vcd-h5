/** *
 * author:1494
 * date:2019/4/2
 * description:
 * use：
 */


import BaseGenerator from './BaseGenerator';

class DailyGenerator extends BaseGenerator {
  constructor(scheduled) {
    super(scheduled);
  }

  /** *
   * ConferenceTime 执行周期会议序列生成操作
   * @returns {Array}
   */
  doGenerate() {
    while (this.continueEnable()) {
      this.createConference();
      this.addInterval();
    }
    
    return this.list;
  }

  addInterval() {
    this.current.add(this.plan.recurrenceInterval, 'days');
  }
}

export default DailyGenerator;
