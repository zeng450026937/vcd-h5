import Analyser from './analyser';

const VolumeAnalyser = Analyser.extend({
  data() {
    return {
      volume : 0,
    };
  },

  methods : {
    analyse() {
      if (this.context && this.contextAnalyser && this.streamSource) {
        const length = this.contextAnalyser.frequencyBinCount;
        const array = new Uint8Array(length);

        this.contextAnalyser.getByteFrequencyData(array);

        const sum = array.reduce((acc, val) => acc + val, 0);

        this.volume = sum / length;
      }
      else {
        this.volume = 0;
      }
    },

    start() {
      Analyser.options.methods.start.call(this);

      this.createContextAnalyser();
      this.createStreamSource();
    },

    stop() {
      Analyser.options.methods.stop.call(this);

      if (this.streamSource) {
        this.streamSource.disconnect();
        this.streamSource = null;
      }

      this.volume = 0;
    },

    createContextAnalyser() {
      if (!window.AudioContext) return;
      if (this.context && this.contextAnalyser) return;

      this.context = new AudioContext();
      this.contextAnalyser = this.context.createAnalyser();
      this.contextAnalyser.fftSize = 1024;
      this.contextAnalyser.smoothingTimeConstant = 0.5;
    },

    createStreamSource() {
      if (this.context && this.stream && this.stream.getAudioTracks().length > 0) {
        // createMediaStreamSource will fail if there is no audio track.
        // use try,catch instead will be better?
        this.streamSource = this.context.createMediaStreamSource(this.stream);
        this.streamSource.connect(this.contextAnalyser);

        if (this.context.state === 'suspended') {
          this.context.resume();
        }
      }
    },
  },

  created() {
    this.context = null;
    this.contextAnalyser = null;
    this.streamSource = null;
  },

  beforeDestroy() {
    if (this.contextAnalyser) {
      this.contextAnalyser.disconnect();
      this.contextAnalyser = null;
    }

    if (this.context) {
      this.context = null;
    }
  },
});

export default VolumeAnalyser;
