import { handlePushMessage } from './handle-push-message';
import { YTMSService } from './ytms-service';

export function install(ytmsService = new YTMSService(), hook) {  
  ytmsService.connect()
    .then((service) => {
      handlePushMessage(service.push, hook);
    // TODO: update client info
    // TODO: do something else. eg. log report
    });

  return ytmsService;
}
