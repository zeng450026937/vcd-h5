/***
 * author:1494
 * date:2019/4/2
 * description:
 * use：
 */
import moment from "moment";
import BaseGenerator from "./BaseGenerator";

class MonthlyGenerator extends BaseGenerator {
  constructor(plan) {
    super(plan);
    this.cacheCurrent = moment(this.current).date(this.plan.dayOfMonth);
    this.cacheRecurrenceInterval = 0;
  }

  /***
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

  /***
   * this.current 直接add months计算出来结果会有问题
   */
  addInterval() {
    this.current = moment(this.cacheCurrent).add(this.cacheRecurrenceInterval += this.plan.recurrenceInterval, 'months');
  }
}


export default MonthlyGenerator;
