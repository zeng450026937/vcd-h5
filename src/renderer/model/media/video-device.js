import Vue from 'vue';
import { debounce } from 'lodash';
import { getUserMedia } from '../../lib/get-user-media';
import StreamAnalyser from './stream-analyser';

const MediaDevice = Vue.extend({
  extends : StreamAnalyser,

  data() {
    return {
      device  : null,
      quality : null,
      error   : null,
    };
  },

  watch : {
    device : {
      deep    : true,
      handler : 'resetStream',
    },

    quality : {
      deep    : true,
      handler : 'resetVideoQuality',
    },
  },

  methods : {
    isAcquiring() {
      return !!this.refCount;
    },

    async acquireStream(force = false) {
      this.refCount++;

      if (this.stream && !force) return Promise.resolve(this.stream);

      try {
        const stream = await getUserMedia(this.genConstraints());

        if (this.stream) {
          this.stream.close();
        }

        if (this.isAcquiring()) {
          this.stream = stream;
        }
        else {
          stream.close();
          this.stream = null;
        }

        this.error = null;       
      }
      catch (error) {
        logger.warn(`Get user media failed, error: ${error}`);

        this.error = error;
        this.stream = null;

        throw error;
      }

      return this.stream;
    },

    async releaseStream(force) {
      // waiting for a moment can avoid re-acquire stream,
      // when acquireStream/releaseStream is invoked really fast(in short time)
      await this.$nextTick();

      if (this.refCount > 0) {
        this.refCount--;
      }

      if (!this.stream) return;

      if (this.refCount === 0 || force) {
        this.stream.close();
        this.stream = null;
      }
    },

    toggle(enabled = true) {
      if (!this.stream) return;

      this.stream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    },

    resetStream : debounce(async function resetStream() {
      if (!this.isAcquiring()) return;

      // must release first, cause audioinput's deviceId might be same,
      // while they are actually different device as groupId is changed.
      await this.release(true);
      await this.acquire(true);
    }, 300),

    resetQuality : debounce(function resetVideoQuality() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      if (!window.MediaStreamTrack.prototype.applyConstraints) {
        this.resetStream();
      }
      else {
        this.stream.getVideoTracks().forEach((track) => {
          track.applyConstraints(this.quality)
            .catch((e) => {
              logger.warn(`Apply video constraints failed: ${e}`);
            });
        });
      }
    }, 300),

    genConstraints() {
      const constraints = {};

      if (this.device) {
        constraints.audio = Object.assign({}, this.device);
      }
      if (constraints.video && this.quality) {
        Object.assign(constraints.video, this.quality);
      }

      return constraints;
    },
  },

  async created() {
    this.refCount = 0;

    await this.$nextTick();

    this.analyzeVolume = true;
  },

  beforeDestroy() {
    if (this.stream) {
      this.stream.close();
      this.stream = null;
    }
  },
});

export default MediaDevice;
