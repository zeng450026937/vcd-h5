import Vue from 'vue';
import StatusAnalyser from './status-analyser';
import VolumeAnalyzer from './volume-analyser';

const StreamAnalyser = Vue.extend({
  data() {
    return {
      stream : null,
    };
  },

  computed : {
    volume() {
      return this.volumeAnalyzer.volume;
    },
    status() {
      return this.statusAnalyser.status;
    },

    analyzeVolume : {
      get() {
        return this.volumeAnalyzer.enable;
      },
      set(val) {
        this.volumeAnalyzer.enable = val;
      },
    },
    analyzeStatus : {
      get() {
        return this.statusAnalyser.enable;
      },
      set(val) {
        this.statusAnalyser.enable = val;
      },
    },
  },

  watch : {
    stream(val) {
      this.statusAnalyser.stream = val;
      this.volumeAnalyzer.stream = val;
    },
  },

  created() {
    this.statusAnalyser = new StatusAnalyser();
    this.volumeAnalyzer = new VolumeAnalyzer();
  },

  beforeDestroy() {
    this.statusAnalyser.$destory();
    this.statusAnalyser = null;
    this.volumeAnalyzer.$destory();
    this.volumeAnalyzer = null;
  },
});

export default StreamAnalyser;
