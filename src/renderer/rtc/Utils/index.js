export function assert(condition, msg) {
  if (!condition) throw new Error(`[ApolloRTC] ${msg}`);
}

export function isIP(input) {
  if (isIPv4(input)) {
    return 4;
  }
  else if (isIPv6(input)) {
    return 6;
  }
  else {
    return 0;
  }
}
export function isIPv4(input) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(input);
}
export function isIPv6(input) {
  return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(input);
}

/**
 * Create a cached version of a pure function.
 */
export function cached(fn) {
  const cache = Object.create(null);

  return (function cachedFn(str) {
    cache[str] = cache[str] || fn(str);

    return cache[str];
  });
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g;
const camelize = cached((str) => str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : '')));

export { camelize };

/**
 * Capitalize a string.
 */
const capitalize = cached((str) => str.charAt(0).toUpperCase() + str.slice(1));

export { capitalize };

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cached((str) => str.replace(hyphenateRE, '-$1').toLowerCase());

export { hyphenate };

export function isEmpty(value) {
  return (value === null
    || value === ''
    || value === undefined
    || (Array.isArray(value) && value.length === 0)
    || (typeof (value) === 'number' && Number.isNaN(value)))
    || (typeof value === 'object' && Object.getOwnPropertyNames(value).length === 0);
}

export function defer(timeout, resolve_cb, reject_cb) {
  const d = {
    promise : null,
    resolve : null,
    reject  : null,
  };

  let timer;

  d.promise = new Promise(((resolve, reject) => {
    d.resolve = (result) => {
      clearTimer();
      if (resolve_cb) resolve_cb(result);
      resolve(result);
    };
    d.reject = (result) => {
      clearTimer();
      if (reject_cb) resolve_cb(result);
      reject(result);
    };
  }));

  if (timeout) {
    timer = setTimeout(d.reject, timeout);
  }

  function clearTimer() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
  }

  return d;
}

export function setupEventHandlers(target, eventHandlers) {
  if (!target) {
    return;
  }

  Object.keys(eventHandlers).forEach((event) => {
    target.on(event, eventHandlers[event]);
  });
}

export function removeEventHandlers(target, eventHandlers) {
  if (!target) {
    return;
  }

  Object.keys(eventHandlers).forEach((event) => {
    target.removeListener(event, eventHandlers[event]);
  });
}

export function closeMediaStream(stream) {
  if (!stream) {
    return;
  }

  // Latest spec states that MediaStream has no stop() method and instead must
  // call stop() on every MediaStreamTrack.
  try {
    let tracks;

    if (stream.getTracks) {
      tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
    else {
      tracks = stream.getAudioTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      tracks = stream.getVideoTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
  }
  catch (error) {
    // Deprecated by the spec, but still in use.
    // NOTE: In Temasys IE plugin stream.stop is a callable 'object'.
    if (typeof stream.stop === 'function' || typeof stream.stop === 'object') {
      stream.stop();
    }
  }
}

export function getLogger(namespace) {
  return {
    warn(msg) {
      console.warn(`[ApolloRTC ${namespace}]: ${msg}`);
    },
    error(msg) {
      console.error(`[ApolloRTC ${namespace}]: ${msg}`);
    },
  };
}

export function arrayfy(obj) {
  let array = obj || [];

  if (!Array.isArray(array)) {
    array = [ obj ];
  }

  return array;
}
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
