import { BaseDatabase } from './base-database';

export class ScheduleDatabse extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      // 周期会议中，所有会议entity一致，record-id唯一
      // 周期会议共享一个template，所以都拥有相同的entity、plan-id
      // 变更某个周期会议中的某一个（record-id）后，plan-id随即发生变更
      // 简而言之，plan-id代表会议详情，record-id代表每一个子会议，entity代表某个周期会议
      conferences : 'record-id, @entity, @plan-id',
      templates   : '@plan-id， @entity',
    });
  }
}
