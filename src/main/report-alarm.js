import { readFile, unlink } from 'fs-extra';
import { basename } from 'path';
import { Alarm } from '../ytms/uploader';
import { getAlarm } from './alarm-name';
import { packLog } from '../logger/pack-log';

export async function doAlarm(name, desc, api) {
  const path = await packLog();
  const logfile = await readFile(path);
  const param = getAlarm(name, desc);

  let alarm;

  if (ytms.enterprise.isReady) {
    alarm = new Alarm(ytms.enterprise.api);
  }
  else {
    alarm = new Alarm(api || ytms.yealink.api);
  }

  alarm.addParam(param);
  alarm.addLog(logfile, basename(path));

  await alarm.upload().catch((e) => logger.log('upload alarm to yealink failed, error: %s', e));
  // ignore anyway
  await unlink(path).catch(() => {});
}
