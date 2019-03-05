import { ALARM_NAME } from './alarm-name';
import { doAlarm } from './report-alarm';
import { formatError } from '../logger/format-error';

export function reportGpuCrash() {
  return doAlarm(ALARM_NAME.GPU_PROCESS_CRASAH);
}

export function reportRendererCrash() {
  return doAlarm(ALARM_NAME.RENDER_PROCESS_CRASAH);
}

export function reportUncaughtException(isLaunchError, error) {
  return doAlarm(ALARM_NAME.MAIN_PROCESS_CRASAH, formatError(error));
}
