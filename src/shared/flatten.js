function isPlainObj(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function flatten(obj, prefix = [], separator = '.') {
  return Object.entries(obj).reduce((acc, [ key, value ]) => Object.assign(
    acc,
    isPlainObj(value)
      ? flatten(value, prefix.concat(key))
      : { [prefix.concat(key).join(separator)]: value }
  ), {});
}
