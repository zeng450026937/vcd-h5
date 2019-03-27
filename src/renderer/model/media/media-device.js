import Vue from 'vue';
import { debounce } from 'lodash';
import { getUserMedia } from '../../lib/get-user-media';
import StreamAnalyser from './stream-analyser';

const MediaDevice = Vue.extend({
  extends : StreamAnalyser,

  data() {
    return {
      audioDevice  : null,
      videoDevice  : null,
      audioQuality : null,
      videoQuality : null,
      error        : null,
    };
  },

  watch : {
    audioDevice : {
      deep    : true,
      handler : 'resetStream',
    },

    videoDevice : {
      deep    : true,
      handler : 'resetStream',
    },

    audioQuality : {
      deep    : true,
      handler : 'resetAudioQuality',
    },

    videoQuality : {
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

    toggleAudio(enabled = true) {
      if (!this.stream) return;

      this.stream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    },

    toggleVideo(enabled = true) {
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

    resetAudioQuality : debounce(function resetAudioQuality() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      if (!window.MediaStreamTrack.prototype.applyConstraints) {
        this.resetStream();
      }
      else {
        this.stream.getAudioTracks().forEach((track) => {
          track.applyConstraints(this.audioQuality)
            .catch((e) => {
              logger.warn(`Apply audio constraints failed: ${e}`);
            });
        });
      }
    }, 300),

    resetVideoQuality : debounce(function resetVideoQuality() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      if (!window.MediaStreamTrack.prototype.applyConstraints) {
        this.resetStream();
      }
      else {
        this.stream.getVideoTracks().forEach((track) => {
          track.applyConstraints(this.videoQuality)
            .catch((e) => {
              logger.warn(`Apply video constraints failed: ${e}`);
            });
        });
      }
    }, 300),

    genConstraints() {
      const constraints = {};

      if (this.audioDevice) {
        constraints.audio = Object.assign({}, this.audioDevice);
      }
      if (this.videoDevice) {
        constraints.video = Object.assign({}, this.videoDevice);
      }
      if (constraints.audio && this.audioQuality) {
        Object.assign(constraints.audio, this.audioQuality);
      }
      if (constraints.video && this.videoQuality) {
        Object.assign(constraints.video, this.videoQuality);
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
