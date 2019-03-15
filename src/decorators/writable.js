export function writable(val = true) {
  return function(target, propertyName, descriptor) {
    descriptor.writable = val;
  
    return descriptor;
  };
}
