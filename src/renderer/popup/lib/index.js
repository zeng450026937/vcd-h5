import Vue from 'vue';
import crypto from 'crypto';

export let _Vue;

export const genUniqueKey = (text) => crypto.createHash('md5')
  .update(text)
  .digest('hex');

export default class Popup {
  static ctx;

  constructor(options) {
    this.maxCache = options.maxCache || 5;
    this.popups = options.popups || {};
    this.instances = new Map();
  }

  static context() {
    return Popup.ctx;
  }

  // static root() {
  //   return Popup.ctx.$root;
  // }

  static rooth() {
    return Popup.ctx.$root.$createElement;
  }

  genVNode({ tag, data, children }, params = {}) {
    return Popup.rooth()(tag, data, Array.isArray(children)
      ? children.map((c) => this.genVNode(c, params)) : params[children] || children);
  }

  genInstance(vpopup, key) {
    let instance = this.instances.get(key);

    if (instance) return instance;

    instance = new Vue({
      name   : key,
      render : () => vpopup,
    });

    instance.$mount();
    document.body.appendChild(instance.$el);
    this.instances.set(key, instance);

    return instance;
  }

  static registerEvent(instance, display, hide) {
    instance.display = display;
    instance.hide = hide;

    return instance;
  }

  modal(option, display, hide) {
    const instance = this.genInstance(this.genVNode(option), genUniqueKey(JSON.stringify(option)));

    return Popup.registerEvent(instance, display, hide);
  }

  prepared(key, params) {
    const popup = this.popups[key];

    if (!popup) throw new Error(`you have not register the popup of ${key}`);

    (popup.components || []).forEach((c) => Vue.component(c.name, c));

    const instance = this.genInstance(this.genVNode(popup, params || popup.params),
      genUniqueKey(JSON.stringify({
        popup, params : params || popup.params,
      })));

    instance.vm = instance.$children[0]; //

    Popup.registerEvent(instance, (flag = 'visible') => {
      instance.vm[flag] = true;
      instance.vm.visible = true;

      return instance;
    }, (flag = 'visible') => {
      instance.vm[flag] = false;
      instance.vm.visible = false;

      return instance;
    });

    if (this.instances.size > 5) { // for improve
      this.destroyInVisible();
    }

    return instance;
  }

  destroyInVisible() {
    Array.from(this.instances.entries()).forEach((entity) => {
      if (!entity[1].vm.visible) {
        entity[1].vm.$destroy();
        this.instances.delete(entity[0]);
      }
    });

    return this;
  }

  destroy(vm) {
    if (!vm) return;
    vm.$destroy();

    return this.cleanInstanceQueue();
  }

  cleanInstanceQueue() {
    Array.from(this.instances.entries()).forEach((entity) => {
      if (entity[1]._isDestroyed) {
        this.instances.delete(entity[0]);
      }
    });

    return this;
  }

  destroyAll() {
    Array.from(this.instances.values()).forEach((vm) => {
      vm.$destroy();
    });
    this.instances.clear();
  }
}

Popup.install = function install($Vue) {
  if (install.installed && $Vue === _Vue) return;

  install.installed = true;
  _Vue = $Vue;

  $Vue.mixin({
    beforeCreate : initPopup,
  });

  function initPopup() {
    const options = this.$options;

    if (options.popup) {
      this.$popup = options.popup;
    }
    else if (options.parent && options.parent.$popup) {
      this.$popup = options.parent.$popup;
    }
    if (!Popup.ctx) Popup.ctx = this;
  }
};
