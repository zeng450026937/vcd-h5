/* eslint-disable no-continue,guard-for-in */
/* eslint-disable no-restricted-syntax */
export function deepClone(o) {
  const type = typeof o;

  if (type === 'function') return o;
  if (o === null || type !== 'object') return o;
  if (o instanceof Date) return new Date(o);
  const o2 = Array.isArray(o) ? new Array(o.length) : {};

  for (const k in o) {
    const cur = o[k];

    if (typeof cur === 'function') {
      o2[k] = cur;
      continue;
    }
    if (cur === null) {
      o2[k] = null;
      continue;
    }
    if (typeof cur === 'object') {
      if (cur instanceof Date) {
        o2[k] = new Date(cur);
        continue;
      }
      o2[k] = deepClone(cur);
      continue;
    }
    o2[k] = cur;
  }

  return o2;
}
