export function arrayify(obj) {
  let array = obj || [];

  if (!Array.isArray(array)) {
    array = [ obj ];
  }

  return array;
}
