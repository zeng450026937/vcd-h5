import Vue from 'vue';
import VolumeAnalyser from './Analyser/VolumeAnalyser';
import StatusAnalyser from './Analyser/StatusAnalyser';
import VideoQuality from './Quality/VideoQuality';
import AudioQuality from './Quality/AudioQuality';
import { getLogger, defer, closeMediaStream } from '../Utils';

const logger = getLogger('MediaDevice');

export default Vue.extend({
  data() {
    return {
      audioDevice    : null,
      videoDevice    : null,
      audioQuality   : null,
      videoQuality   : null,
      stream         : null,
      error          : null,
      streamHolder   : 0,
      volumeAnalyser : null,
      statusAnalyser : null,
      muteAudio      : false,
      muteVideo      : false,
    };
  },
  computed : {
    constraints() {
      return {
        audio : this.audioDevice
          ? this.audioDevice.constraints
          : false,
        video : this.videoDevice
          ? this.videoDevice.constraints
          : false,
      };
    },
    volume() {
      return this.volumeAnalyser.volume;
    },
    status() {
      return this.statusAnalyser.status;
    },
  },
  watch : {
    audioDevice(device) {
      if (device && device.kind === 'audioinput') {
        device.quality = this.audioQuality;
      }

      this._resetStream();
    },
    videoDevice(device) {
      if (device && device.kind === 'videoinput') {
        device.quality = this.videoQuality;
      }

      this._resetStream();
    },
    'audioQuality.$data' : {
      handler() {
        this._resetAudioQuality();
      },
      deep : true,
    },
    'videoQuality.$data' : {
      handler() {
        this._resetVideoQuality();
      },
      deep : true,
    },
    stream(stream) {
      this.volumeAnalyser.stream = stream;
      this.statusAnalyser.stream = stream;

      this.toggleAudio(!this.muteAudio);
      this.toggleVideo(!this.muteVideo);
    },
    muteAudio(val) {
      this.toggleAudio(!val);
    },
    muteVideo(val) {
      this.toggleVideo(!val);
    },
  },
  created() {
    this.volumeAnalyser = new VolumeAnalyser();
    this.statusAnalyser = new StatusAnalyser();

    this.volumeAnalyser.enable = true;
    this.statusAnalyser.enable = true;
  },
  destroyed() {
    this.volumeAnalyser.enable = false;
    this.statusAnalyser.enable = false;

    this.volumeAnalyser = null;
    this.statusAnalyser = null;
  },
  methods : {
    isAcquiring() {
      return this.streamHolder > 0;
    },

    acquireDetachedStream(audio = true, video = true) {
      const constraints = {};

      if (audio) {
        constraints.audio = this.constraints.audio;
      }
      if (video) {
        constraints.video = this.constraints.video;
      }

      return navigator.mediaDevices.getUserMedia(constraints);
    },

    acquireStream(force = false) {
      const dfer = defer();

      if (this.streamHolder === 0 || force) {
        navigator.mediaDevices.getUserMedia(this.constraints)
          .then((stream) => {
            if (!this.isAcquiring()) {
              closeMediaStream(stream);
              closeMediaStream(this.stream);

              this.stream = null;
            }
            else {
              closeMediaStream(this.stream);

              this.stream = stream;
            }

            this.error = null;

            dfer.resolve(this.stream);
          })
          .catch((error) => {
            logger.warn(`getUserMedia error: ${error}`);

            this.error = error;
            this.stream = null;

            dfer.reject(error);
          });
      }
      else {
        dfer.resolve(this.stream);
      }

      this.streamHolder++;

      return dfer.promise;
    },

    releaseStream(force = false) {
      if (this.streamHolder > 0) {
        this.streamHolder--;
      }

      if (this.streamHolder <= 0 || force) {
        closeMediaStream(this.stream);

        this.stream = null;
        this.error = null;
        this.streamHolder = 0;
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

    _resetStream() {
      if (!this.isAcquiring()) return;

      // const holder = this.streamHolder;

      // this.releaseStream(true);
      this.acquireStream(true).finally(() => this.releaseStream());

      // this.streamHolder = holder;
    },

    _resetAudioQuality() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      if (!window.MediaStreamTrack.prototype.applyConstraints) {
        this._resetStream();
      }
      else {
        this.stream.getAudioTracks().forEach((track) => {
          track.applyConstraints(this.audioDevice.constraints)
            .catch((e) => {
              logger.warn(`Apply audio constraints failed: ${e}`);
            });
        });
      }
    },

    _resetVideoQuality() {
      if (!this.isAcquiring()) return;
      if (!this.stream) return;

      if (!window.MediaStreamTrack.prototype.applyConstraints) {
        this._resetStream();
      }
      else {
        this.stream.getVideoTracks().forEach((track) => {
          track.applyConstraints(this.videoDevice.constraints)
            .catch((e) => {
              logger.warn(`Apply video constraints failed: ${e}`);
            });
        });
      }
    },
  },
});
