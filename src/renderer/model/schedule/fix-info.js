import { Utils } from 'apollosip';

const DESC_KEY = 'conference-description';
const TIMESTAMP_KEYS = [ 'last-update-time', 'start-time', 'expiry-time' ];

export function fixConference(val) {
  if (!val) return;
  
  const desc = val[DESC_KEY];

  delete val[DESC_KEY];

  Object.assign(val, desc);

  fixTimestamp(val);

  return val;
}

export function fixTemplate(val) {
  if (!val) return;

  const info = val['conference-info'];
  const desc = info[DESC_KEY];

  delete info[DESC_KEY];

  Object.assign(info, desc);

  fixTimestamp(info);

  return info;
}

export function fixTimestamp(val) {
  TIMESTAMP_KEYS.forEach((key) => {
    const timestamp = val[key];

    if (timestamp) {
      val[key] = new Date(`${timestamp} GMT`);
    }
  });
}
