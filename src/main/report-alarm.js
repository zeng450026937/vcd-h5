import { readFile, unlink } from 'fs-extra';
import { basename } from 'path';
import { Alarm } from '../ytms/uploader';
import { getAlarm } from './alarm-name';
import { packLog } from '../logger/pack-log';
import { newPlainUUID } from '../utils/uuid';

export async function doAlarm(name, desc, api) {
  api = api || ytms.yealink.api;

  if (!api) throw new Error('Missing api');

  const path = await packLog(newPlainUUID());
  const logfile = await readFile(path);

  const param = getAlarm(name, desc);
  const alarm = new Alarm(api);

  alarm.addParam(param);
  alarm.addLog(logfile, basename(path));

  await alarm.upload().catch((e) => console.log(e));
  // ignore anyway
  await unlink(path).catch(() => {});
}
