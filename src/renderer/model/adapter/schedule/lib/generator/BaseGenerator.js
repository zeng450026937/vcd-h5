/***
 * author:1494
 * date:2019/4/2
 * description:
 * use：
 */
import moment from 'moment';

import ConferenceTime from '../model/ConferenceTime';
import ConferencePlan from '../model/ConferencePlan';


class BaseGenerator {

  constructor(scheduled, debug = true) {

    /***
     * 单条日程数据
     */
    this.scheduled = scheduled;

    /***
     * 获取到单条记录待展开的模型
     * @type {ConferenceTime}
     */
    this.plan = new ConferenceTime(scheduled);

    /***
     * 预约时候选择的时区,每次的跨度都是一个周期{待验证 todo}
     * @returns {moment.Moment}
     * @private
     */
    this.current = moment(this.plan.startDateTime).utcOffset(this.plan.timeZoneConfig.offsetDisplayName);

    /***
     * 调试模式下验证数据格式
     */
    if (debug && !this.plan.check()) {
      console.error('plan error', scheduled);
      throw 'plan error' + JSON.stringify(scheduled);
    }
    this.list = [];
  }

  /**
   * 判断是否还有plan
   * @returns {boolean}
   */
  continueEnable(current = this.current) {
    //max 366 *10
    return current.isBefore(this.plan._rangeEndDate) && this.list.length <= 366 * 10;
  }

  /***
   * 讲当前会议指向下一个周期
   */
  addInterval() {
    this.current = this.current.add(1, 'days');
  }

  /***
   * ConferenceTime 执行周期会议序列生成操作
   * @returns {Array}
   */
  doGenerate() {
    return this.list;
  }

  /***
   * 创建plan
   * @returns {*}
   */
  createConference(current = this.current) {
    const startDateTime = current.valueOf();
    const plan = new ConferencePlan(this.scheduled)
      .setStartTime(startDateTime)
      .setEndTime(startDateTime + this.plan._duration)
      .setSequence(this._getSequence());
    // .setTests({current: current.format(), weekday: current.weekday()});
    this.list.push(plan);
    return plan;
  }

  _getSequence() {
    return this.list.length + 1;
  }

}

export default BaseGenerator;
