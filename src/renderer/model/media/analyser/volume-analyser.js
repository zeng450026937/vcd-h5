import Analyser from './analyser';

export const VolumeAnalyzer = Analyser.extend({
  data() {
    return {
      interval     : 100,
      volume       : 0,
      context      : null,
      streamSource : null,
      analyser     : null,
    };
  },
  watch : {
    enable(enable) {
      if (enable) {
        this.createStreamSource();
      }
      else {
        if (this.streamSource) {
          this.streamSource.disconnect();
          this.streamSource = null;
        }
        if (this.analyser) {
          this.analyser.disconnect();
        }
        this.volume = 0;
      }
    },
    stream(stream) {
      if (!stream) return;
      this.createStreamSource();
    },
  },
  created() {
    if (window.AudioContext) {
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.5;
    }
  },
  destroyed() {
    this.context = null;
    this.analyser = null;
  },
  methods : {
    analyse() {
      if (this.context && this.analyser && this.streamSource) {
        const length = this.analyser.frequencyBinCount;
        const array = new Uint8Array(length);

        this.analyser.getByteFrequencyData(array);

        const sum = array.reduce((acc, val) => acc + val, 0);

        this.volume = sum / length;
      }
      else {
        this.volume = 0;
      }
    },
    createStreamSource() {
      if (this.context && this.stream && this.stream.getAudioTracks().length > 0) {
        // createMediaStreamSource will fail if there is no audio track.
        // use try,catch instead will be better?
        this.streamSource = this.context.createMediaStreamSource(this.stream);
        this.streamSource.connect(this.analyser);

        if (this.context.state === 'suspended') {
          this.context.resume();
        }
      }
    },
  },
});
