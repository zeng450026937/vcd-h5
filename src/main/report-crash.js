import { Alarm } from '../ytms/uploader';

export function reportGpuCrash() {
  const api = ytms.getApi();

  if (!api) return;

  const alarm = Alarm.Create(api);

  alarm.type = 'gpu';

  alarm.upload();
}

export function reportRendererCrash() {
  const api = ytms.getApi();

  if (!api) return;
  
  const alarm = Alarm.Create(api);

  alarm.type = 'renderer';

  alarm.upload();
}

export function reportUncaughtException(isLaunchError, error) {
  const api = ytms.getApi();

  if (!api) return;
  
  const alarm = Alarm.Create(api);

  alarm.type = 'browser';

  alarm.upload();
}
