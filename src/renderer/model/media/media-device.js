import Vue from 'vue';
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

    async acquire(force = false) {
      this.refCount++;

      if (this.stream && !force) return Promise.resolve(this.stream);

      try {
        const stream = await getUserMedia(this.genConstraints());

        if (this.stream) {
          this.stream.close();
          this.stream = null;
        }

        if (this.isAcquiring()) {
          this.stream = stream;
        }

        this.error = null;       
      }
      catch (error) {
        this.error = error;
        this.stream = null;
      }

      return this.stream;
    },

    release() {
      if (this.refCount > 0) {
        this.refCount--;
      }

      if (this.refCount === 0 && this.stream) {
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

    async resetStream() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      await this.acquire(true);

      this.release();
    },

    resetAudioQuality() {
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
    },

    resetVideoQuality() {
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
    },

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
