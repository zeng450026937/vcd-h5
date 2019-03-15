export function isPlainObj(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isEmpty(value) {
  return (value === null
    || value === ''
    || value === undefined
    || (Array.isArray(value) && value.length === 0)
    || (typeof (value) === 'number' && Number.isNaN(value)))
    || (typeof value === 'object' && Object.getOwnPropertyNames(value).length === 0);
}
