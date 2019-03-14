let Vue;

export default class Sketch {
  static install(_Vue) {
    if (Vue && Vue === _Vue) return;
    Vue = _Vue;

    Vue.mixin({
      beforeCreate() {
        const options = this.$options;

        if (options.sketch && options.sketch.props) {
          console.warn(this);
          const path = options.sketch.module.split('.');

          let sketch = this.$model;

          path.forEach((p) => sketch = sketch[p]);

          options.sketch.props.forEach((p) => {
            options.computed[p] = {
              get() { return sketch[p]; },
              set(val) { sketch[p] = val; },
            };
            // Reflect.defineProperty(this, p, {
            //   get() { return sketch[p]; },
            //   set(val) { sketch[p] = val; },
            // });
          });
        }
      },
    });
  }
}
