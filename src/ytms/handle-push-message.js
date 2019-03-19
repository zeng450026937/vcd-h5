import { Notification } from 'electron';
import axios from 'axios';
import { MESSAGE_TYPE } from './push-service';
import { JobManager } from './job';
import { NetLogJob } from './netlog-job';
import { LogJob } from './log-job';

const jobManager = new JobManager();

export function showNotification(title, body) {
  if (typeof body === 'object') {
    body = JSON.stringify(body);
  }
  
  new Notification({ title, body }).show();
}

export function handlePushMessage(pushService, hook) {
  pushService.on('notify', (type, body) => {
    logger.info('receive push message: %s (%s)', type, MESSAGE_TYPE[type], body);
    
    showNotification(MESSAGE_TYPE[type], body);

    const api = ytms.api;

    let sessionId = null;

    let job = null;

    switch (type) {
      case MESSAGE_TYPE.START_NETLOG:
        ({ sessionId } = body);

        job = jobManager.find(sessionId);

        if (!job) {
          job = new NetLogJob(api, sessionId);
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

      case MESSAGE_TYPE.GET_LOG:
        ({ sessionId } = body);

        job = jobManager.find(sessionId);

        if (!job) {
          job = new LogJob(api, sessionId);
        }

        jobManager.add(job);
        break;

      case MESSAGE_TYPE.PUT_CONFIG:
        axios(body.downloadUrl)
          .then((res) => {
            global.mainWindow.sendSystemConfig(res.data);
          })
          .catch((e) => logger.warn('download config file failed, error: %s', e));
        break;

      default:
        break;
    }
    
    if (hook) {
      hook(type, body);
    }
  });
}
