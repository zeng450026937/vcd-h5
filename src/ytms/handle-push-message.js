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

export function handlePushMessage(pushService, hook = showNotification) {
  const { 
    PUT_CONFIG,
    PUT_MESSAGE,
    PUT_UPDATE,
    GET_CONFIG,
    GET_LOG,
    START_NETLOG,
    STOP_NETLOG,
  } = MESSAGE_TYPE;

  pushService.on(PUT_CONFIG, (body) => hook(MESSAGE_TYPE[PUT_CONFIG], body));
  pushService.on(PUT_MESSAGE, (body) => hook(MESSAGE_TYPE[PUT_MESSAGE], body));
  pushService.on(PUT_UPDATE, (body) => hook(MESSAGE_TYPE[PUT_UPDATE], body));
  pushService.on(GET_CONFIG, (body) => hook(MESSAGE_TYPE[GET_CONFIG], body));
  pushService.on(GET_LOG, (body) => hook(MESSAGE_TYPE[GET_LOG], body));
  pushService.on(START_NETLOG, (body) => hook(MESSAGE_TYPE[START_NETLOG], body));
  pushService.on(STOP_NETLOG, (body) => hook(MESSAGE_TYPE[STOP_NETLOG], body));
}
