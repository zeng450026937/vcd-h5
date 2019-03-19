import { readFile, unlink } from 'fs-extra';
import { basename } from 'path';
import { Alarm } from '../ytms/uploader';
import { getAlarm } from './alarm-name';
import { packLog } from '../logger/pack-log';

export async function doAlarm(name, desc, api = ytms.api) {
  if (!api) {
    logger.warn('api is not ready');

    return;
  }

  const path = await packLog();
  const logfile = await readFile(path);
  const param = getAlarm(name, desc);
  const alarm = new Alarm(api);

  alarm.addParam(param);
  alarm.addLog(logfile, basename(path));

  await alarm.upload().catch((e) => logger.error('upload alarm to yealink failed, error: %s', e));
  // ignore anyway
  await unlink(path).catch(() => {});
}
