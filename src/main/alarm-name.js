/**
 * alarmLevel
 * 
 * 0 - critical
 * 1 - error
 * 2 - warn
 * */

/**
 * alarmCode
 * 
 * 000000 ~ 099999 critical
 * 100000 ~ 199999 error
 * 200000 ~ 299999 warn
 */

export function normalizeCode(code, length = 6) {
  return (Array(length).join('0') + code).slice(-length);
}

const ALARM_NAME = {};

ALARM_NAME[ALARM_NAME.MAIN_PROCESS_CRASAH = 0] = 'MAIN_PROCESS_CRASAH';
ALARM_NAME[ALARM_NAME.GPU_PROCESS_CRASAH = 1] = 'GPU_PROCESS_CRASAH';
ALARM_NAME[ALARM_NAME.RENDER_PROCESS_CRASAH = 2] = 'RENDER_PROCESS_CRASAH';
ALARM_NAME[ALARM_NAME.CONFERENCE_CONNECT_ERROR = 3] = 'CONFERENCE_CONNECT_ERROR';
ALARM_NAME[ALARM_NAME.CONFERENCE_ABRUPT_ERROR = 4] = 'CONFERENCE_ABRUPT_ERROR';
ALARM_NAME[ALARM_NAME.CONFERENCE_CONTROL_API_ERROR = 5] = 'CONFERENCE_CONTROL_API_ERROR';
ALARM_NAME[ALARM_NAME.CONTACT_API_ERROR = 6] = 'CONTACT_API_ERROR';
ALARM_NAME[ALARM_NAME.SCHEDULE_API_ERROR = 7] = 'SCHEDULE_API_ERROR';

export { ALARM_NAME };

const ALARM_TYPE = {};

ALARM_TYPE[ALARM_TYPE.PROCESS_ERROR = 0] = 'PROCESS';
ALARM_TYPE[ALARM_TYPE.API_ERROR = 1] = 'API';

export { ALARM_TYPE };

const ALARM_LEVEL = {};

ALARM_LEVEL[ALARM_LEVEL.CRITICAL = 0] = 'CRITICAL';
ALARM_LEVEL[ALARM_LEVEL.ERROR = 1] = 'ERROR';
ALARM_LEVEL[ALARM_LEVEL.WARN = 1] = 'WARN';

export { ALARM_LEVEL };

export function getAlarm(name, desc = '') {
  let alarmCode = '';
  let alarmName = '';
  let alarmLevel = 0;
  let alarmType = '';
  let alarmDesc = '';
  const alarmTime = Date.now();

  switch (name) {
    case ALARM_NAME.MAIN_PROCESS_CRASAH:
      alarmLevel = ALARM_LEVEL.CRITICAL;
      alarmType = ALARM_TYPE.PROCESS_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.GPU_PROCESS_CRASAH:
      alarmLevel = ALARM_LEVEL.CRITICAL;
      alarmType = ALARM_TYPE.PROCESS_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.RENDER_PROCESS_CRASAH:
      alarmLevel = ALARM_LEVEL.CRITICAL;
      alarmType = ALARM_TYPE.PROCESS_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.CONFERENCE_CONNECT_ERROR:
      alarmLevel = ALARM_LEVEL.ERROR;
      alarmType = ALARM_TYPE.API_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.CONFERENCE_ABRUPT_ERROR:
      alarmLevel = ALARM_LEVEL.ERROR;
      alarmType = ALARM_TYPE.API_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.CONFERENCE_CONTROL_API_ERROR:
      alarmLevel = ALARM_LEVEL.ERROR;
      alarmType = ALARM_TYPE.API_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.CONTACT_API_ERROR:
      alarmLevel = ALARM_LEVEL.ERROR;
      alarmType = ALARM_TYPE.API_ERROR;
      alarmDesc = desc;
      break;
    case ALARM_NAME.SCHEDULE_API_ERROR:
      alarmLevel = ALARM_LEVEL.ERROR;
      alarmType = ALARM_TYPE.API_ERROR;
      alarmDesc = desc;
      break;
    default:
      break;
  }

  alarmCode = normalizeCode(name);
  alarmName = ALARM_NAME[name];

  return {
    alarmCode,
    alarmName,
    alarmLevel,
    alarmType,
    alarmDesc,
    alarmTime,
  };
}