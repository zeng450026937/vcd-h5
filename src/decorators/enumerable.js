export function enumerable(val = true) {
  return function(target, propertyName, descriptor) {
    descriptor.enumerable = val;
  
    return descriptor;
  };
}
