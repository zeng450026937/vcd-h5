export function configurable(val = true) {
  return function(target, propertyName, descriptor) {
    descriptor.configurabel = val;
  
    return descriptor;
  };
}
