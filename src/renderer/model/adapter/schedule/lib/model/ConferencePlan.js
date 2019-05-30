/** *
 * author:1494
 * date:2019/4/2
 * description:
 * use：展开后返回给外部调用的信息模型
 */

export default class ConferencePlan {
  constructor(plan) {
    /**
     * 缓存信息
     */
    this._plan = plan;

    /**
     * 会议预约记录ID
     */
    this.planId = plan && plan.planId;

    /**
     * 会议序列号
     */
    this.sequence = '';

    /**
     * 会议开始时间
     */
    this.startDateTime = '';

    /**
     * 会议结束时间
     */
    this.endDateTime = '';

    /**
     * 会议详情
     */
    Object.assign(this, plan);
  }

  getEndTime() {
    return this.endDateTime;
  }

  setEndTime(endDateTime) {
    this.endDateTime = endDateTime;
    
    return this;
  }

  getStartTime() {
    return this.startDateTime;
  }

  setStartTime(startDateTime) {
    this.startDateTime = startDateTime;
    
    return this;
  }

  getSequence() {
    return this.sequence;
  }

  setSequence(sequence) {
    this.sequence = sequence;
    
    return this;
  }

  // for test
  setTests(obj) {
    this._tests = obj;
    
    return this;
  }
}
