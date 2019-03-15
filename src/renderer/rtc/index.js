import { assert } from './Utils';
import Media from './Media';
import Account from './Account';
import Conference from './Conference';
import Call from './Call';
import IPCall from './IPCall';
import Contact from './Contact';

let Vue;

class ApolloRTC {
  static install(_Vue) {
    if (Vue && _Vue === Vue) return;

    Vue = _Vue;

    checkVueVersion();

    Vue.mixin({ beforeCreate: rtcInit });

    function rtcInit() {
      const options = this.$options;

      if (options.rtc) {
        this.$rtc = typeof options.rtc === 'function'
          ? options.rtc()
          : options.rtc;
      }
      else
      if (options.parent && options.parent.$rtc) {
        this.$rtc = options.parent.$rtc;
      }
    }
  }

  static get Version() {
    return process.env.VERSION;
  }

  constructor(options) {
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      ApolloRTC.install(window.Vue);
    }

    assert(Vue, 'must call Vue.use(ApolloRTC) before creating a ApolloRTC instance.');
    checkVueVersion();

    return createRTC(options);
  }
}

function createRTC(options = {}) {
  checkCompatibility();

  return new Vue({
    data() {
      return {
        options,
        media      : null,
        account    : null,
        call       : null,
        conference : null,
      };
    },
    created() {
      this.media = new Media({
        parent : this,
      });
      this.account = new Account({
        parent : this,
      });
      this.call = new Call({
        parent : this,
      });
      this.ipcall = new IPCall({
        parent : this,
      });
      this.conference = new Conference({
        parent : this,
      });
      this.contact = new Contact({
        parent : this,
      });
      if (!(global.chrome && global.chrome.app && global.chrome.app.runtime)) {
        const addEventListener = getPrefixedProperty(window, 'addEventListener');

        addEventListener('beforeunload', () => {
          this.$destroy();
        });
      }
    },
    destroyed() {
      this.media.$destroy();
      this.account.$destroy();
      this.call.$destroy();
      this.conference.$destroy();
    },
  });
}

function checkCompatibility() {
  assert(typeof window !== 'undefined', 'ApolloRTC only works on browser.');
  assert(window.MediaStream, 'ApolloRTC requires MediaStream in this browser.');
  assert(window.MediaStreamTrack, 'ApolloRTC requires MediaStreamTrack in this browser.');
  assert(window.Audio, 'ApolloRTC requires Audio in this browser.');
  assert(window.AudioContext, 'ApolloRTC requires AudioContext in this browser.');
  assert(window.RTCPeerConnection, 'ApolloRTC requires RTCPeerConnection in this browser.');
  assert(window.WebSocket, 'ApolloRTC requires WebSocket in this browser.');
  assert(navigator.mediaDevices, 'ApolloRTC requires mediaDevices in this browser.');
}

function checkVueVersion(requiredVue) {
  const vueDep = requiredVue || '^2.5.10';
  const required = vueDep.split('.', 3).map((v) => Number.parseInt(v.replace(/\D/g, ''), 10));
  const actual = Vue.version.split('.', 3).map((n) => Number.parseInt(n, 10));
  // Simple semver caret range comparison
  const passes = actual[0] === required[0] && ( // major matches
    // minor is greater
    (actual[1] > required[1])
    // or minor is eq and patch is >=
    || (actual[1] === required[1] && actual[2] >= required[2])
  );

  assert(passes, `ApolloRTC requires Vue version ${vueDep}.`);
}

function getPrefixedProperty(object, name) {
  if (object === null || typeof object === 'undefined') {
    return function() {};
  }

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const prefixedNames = [ name, `webkit${capitalizedName}`, `moz${capitalizedName}` ];

  const prefixedName = prefixedNames.find((prefixed) => object[prefixed]);

  if (!prefixedName) return function() {};

  return object[prefixedName].bind(object);
}

export { checkCompatibility };
export default ApolloRTC;
