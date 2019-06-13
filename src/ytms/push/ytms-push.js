import PushService from './push-service';
import { parseJSON } from './utils';

export default class YTMSPush extends PushService {
  constructor(option) {
    super(option);
    this.appid = 'vcs';
  }

  analyzeContent(content, msgType) {
    if (!content) return;

    const option = {};

    switch (msgType) {
      case 65536: { // 联系人
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
