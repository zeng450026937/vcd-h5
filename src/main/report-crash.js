import { Alarm } from '../ytms/uploader';
import { getAlarm, ALARM_NAME } from './alarm';
import { formatError } from '../logger/format-error';

export function doAlarm(name, desc) {
  const api = ytms.getApi();

  if (!api) return;

  const { 
    alarmCode,
    alarmName,
    alarmLevel,
    alarmType,
    alarmDesc,
  } = getAlarm(name, desc);
  const alarm = Alarm.Create(api);

  alarm.code = alarmCode;
  alarm.name = alarmName;
  alarm.level = alarmLevel;
  alarm.type = alarmType;
  alarm.desc = alarmDesc;

  alarm.upload().catch((e) => console.log(e));
}

export function reportGpuCrash() {
  return doAlarm(ALARM_NAME.GPU_PROCESS_CRASAH);
}

export function reportRendererCrash() {
  return doAlarm(ALARM_NAME.RENDER_PROCESS_CRASAH);
}

export function reportUncaughtException(isLaunchError, error) {
  return doAlarm(ALARM_NAME.MAIN_PROCESS_CRASAH, formatError(error));
}
