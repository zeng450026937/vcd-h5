import { Notification } from 'electron';
import { MESSAGE_TYPE } from './push-service';

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
    showNotification(MESSAGE_TYPE[type], body);
    
    if (hook) {
      hook(type, body);
    }
  });
}
