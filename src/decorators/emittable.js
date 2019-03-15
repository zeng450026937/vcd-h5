import { 
  configurable,
} from './configurable';
import { 
  enumerable,
} from './enumerable';

export function emittable(target) {
  return class extends target {
    @enumerable(false)
    @configurable(false)
    events = Object.create(null);

    on(event, fn) {
      if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          this.on(event[i], fn);
        }
      }
      else {
        (this.events[event] || (this.events[event] = [])).push(fn);
      }
    
      return this;
    }

    once(event, fn) {
      function on(...args) {
        this.$off(event, on);
        fn.apply(this, args);
      }
      on.fn = fn;
      this.$on(event, on);
    
      return this;
    }

    off(event, fn) {
    // all

      if (!arguments.length) {
        this.events = Object.create(null);
      
        return this;
      }
      // array of events
      if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          this.$off(event[i], fn);
        }
      
        return this;
      }
      // specific event
      const cbs = this.events[event];

      if (!cbs) {
        return this;
      }
      if (!fn) {
        this.events[event] = null;
      
        return this;
      }
      if (fn) {
      // specific handler
        let cb;
        let i = cbs.length;

        while (i--) {
          cb = cbs[i];
          if (cb === fn || cb.fn === fn) {
            cbs.splice(i, 1);
            break;
          }
        }
      }
    
      return this;
    }

    emit(event, ...args) {
      const cbs = this.events[event];

      if (cbs) {
        cbs.forEach((cb) => cb.apply(this, args));
      }
    
      return this;
    }
  };
}
