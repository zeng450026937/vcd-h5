import { Utils } from 'apollosip';

const DESC_KEY = 'conference-description';
const TIMESTAMP_KEYS = [ 'last-update-time', 'start-time', 'expiry-time' ];

export function fixConference(val) {
  const desc = val[DESC_KEY];

  delete val[DESC_KEY];

  Object.assign(val, desc);

  fixTimestamp(val);

  return val;
}

export function fixTemplate(val) {
  const info = val['conference-info'];
  const desc = info[DESC_KEY];

  delete info[DESC_KEY];

  Object.assign(info, desc);

  fixTimestamp(info);

  return info;
}

function toUTC(date) {
  return new Date(date.toGMTString().slice(0, -4));
}

export function fixTimestamp(val) {
  TIMESTAMP_KEYS.forEach((key) => {
    const timestamp = val[key];

    if (timestamp) {
      val[key] = toUTC(Utils.parseDate(timestamp));
    }
  });
}
