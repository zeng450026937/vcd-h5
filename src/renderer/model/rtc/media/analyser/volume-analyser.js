import Analyser from './analyser';

export const VolumeAnalyzer = Analyser.extend({
  data() {
    return {
      volume: 0,
    };
  },

  watch: {
    stream(val) {
      if (!val) return;
      // reset stream source
      this.createStreamSource();
    },
  },

  methods: {
    analyse() {
      if (!this.context || this.contextAnalyser || this.streamSource) {
        this.volume = 0;

        return;
      }
      
      const length = this.contextAnalyser.frequencyBinCount;
      const array = new Uint8Array(length);

      this.contextAnalyser.getByteFrequencyData(array);

      const sum = array.reduce((acc, val) => acc + val, 0);

      this.volume = sum / length;
    },

    start() {
      // lazy create context analyser
      this.createContextAnalyser();

      if (!this.streamSource) return;

      Analyser.options.methods.start.call(this, val);
    },

    stop() {
      if (this.streamSource) {
        this.streamSource.disconnect();
        this.streamSource = null;
      }

      this.volume = 0;

      Analyser.options.methods.stop.call(this, val);
    },

    createStreamSource() {
      if (this.streamSource) {
        this.streamSource.disconnect();
        this.streamSource = null;
      }

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

    createContextAnalyser() {
      if (this.context && this.contextAnalyser) return;

      if (!window.AudioContext) {
        console.warn('cannot context analyser');

        return;
      }

      this.context = new AudioContext();
      this.contextAnalyser = this.context.createAnalyser();
      this.contextAnalyser.fftSize = 1024;
      this.contextAnalyser.smoothingTimeConstant = 0.5;
    },
  },

  created() {
    this.streamSource = null;
    this.context = null;
    this.contextAnalyser = null;
  },

  destroyed() {
    if (this.contextAnalyser) {
      this.contextAnalyser.disconnect();
      this.contextAnalyser = null;
    }

    if (this.context) {
      this.context = null;
    }
  },
});