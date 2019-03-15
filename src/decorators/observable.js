function cached(fn) {
  const cache = Object.create(null);

  return (function cachedFn(str) {
    const hit = cache[str];

    return hit || (cache[str] = fn(str));
  });
}

const capitalize = cached((str) => str.charAt(0).toUpperCase() + str.slice(1));

export function observable(target, propertyName, descriptor) {
  let { val } = descriptor; 
  const { get, set, initializer } = descriptor;

  if (initializer) {
    val = initializer.call(target);
  }

  function getValue() {
    return get ? get.call(target) : val;
  }
  function setValue(newVal) {
    return set ? set.call(target, newVal) : val = newVal;
  }
  
  const eventName = `${propertyName}Changed`;
  const callbackName = `on${capitalize(eventName)}`;

  return {
    configurable : descriptor.configurable,
    enumerable   : descriptor.enumerable,
    get() {
      return getValue.call(this);
    },
    set(newVal) {
      const value = getValue.call(this);
  
      if (newVal !== value) {
        setValue(newVal);
        const callback = this[callbackName];
        const emit = this.emit;

        callback && callback.call(this, newVal, value);
        emit && emit.call(this, eventName, newVal, value);
      }
    },
  };
}
