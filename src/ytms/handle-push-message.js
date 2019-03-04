import { Notification } from 'electron';
import { MESSAGE_TYPE } from './push-service';
import { JobManager } from './job';
import { NetLogJob } from './netlog-job';

const jobManager = new JobManager();

export function showNotification(title, body) {
  if (typeof body === 'object') {
    body = JSON.stringify(body);
  }

  if (process.type === 'browser') {
    new Notification({ title, body }).show();
  }
  else if (process.type === 'renderer') {
    /* eslint-disable no-new */
    new window.Notification(title, { body });
    /* eslint-enable no-new */
  }
}

export function handlePushMessage(pushService, hook) {
  pushService.on('notify', (type, body) => {
    console.log(type, body);
    
    showNotification(MESSAGE_TYPE[type], body);

    let sessionId;
    let job;

    switch (type) {
      case MESSAGE_TYPE.START_NETLOG:
        ({ sessionId } = body);

        job = jobManager.find(sessionId);

        if (!job) {
          job = new NetLogJob(ytms.getApi(), sessionId);
        }

        jobManager.add(job);
        break;
      case MESSAGE_TYPE.STOP_NETLOG:
        ({ sessionId } = body);

        job = jobManager.find(sessionId);

        if (job) {
          job.stop();
        }
        break;
      case MESSAGE_TYPE.GET_CONFIG:
        break;
      case MESSAGE_TYPE.GET_LOG:
        break;
      
      default:
        break;
    }
    
    if (hook) {
      hook(type, body);
    }
  });
}
