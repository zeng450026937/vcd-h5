import { Alarm } from '../ytms/uploader';
import { getAlarm } from './alarm-name';

export async function doAlarm(name, desc, api) {
  api = api || ytms.yealink.api;

  if (!api) throw new Error('Missing api');

  const param = getAlarm(name, desc);
  const alarm = new Alarm(api);

  alarm.addParam(param);
  // TODO: add log file

  await alarm.upload().catch((e) => console.log(e));
}
