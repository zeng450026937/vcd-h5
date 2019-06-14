import BaseGenerator from "./BaseGenerator";

class OnceGenerator extends BaseGenerator {
  constructor(plan) {
    super(plan);
  }

  /***
   * ConferenceTime 执行周期会议序列生成操作
   * @returns {Array}
   */
  doGenerate() {
    this.createConference();
    return this.list;
  }
}

export default OnceGenerator;
