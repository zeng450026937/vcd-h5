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

export const camelize = cached((str) => str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : '')));

/**
 * Capitalize a string.
 */
export const capitalize = cached((str) => str.charAt(0).toUpperCase() + str.slice(1));

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g;

export const hyphenate = cached((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
