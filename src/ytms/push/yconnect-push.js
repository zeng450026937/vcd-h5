import PushService from './push-service';
import { parseJSON } from './utils';

export default class YConnectPush extends PushService {
  constructor(options) {
    super(options);
    this.appid = 'vcs';
  }

  analyzeContent(content, msgType) {
    if (!content) return;

    const option = {};

    switch (msgType) {
      case 262146: { // 日程
        const { operationType, planId, sequence } = parseJSON(content);

        option.type = `SCHEDULE_${operationType}`;
        option.body = {
          planId, sequence,
        };
      }
        break;
      case 262145: { // 联系人
        const { type, body } = parseJSON(content);

        option.type = type;
        option.body = body;
      }
        break;
      default: return;
    }

    this.emit('notify', option.type, option.body);
  }
}
