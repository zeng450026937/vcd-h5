import Quality from './Quality';

export default Quality.extend({
  mixins : [ Quality ],
  data() {
    return {
      kind             : 'audio',
      autoGainControl  : true,
      channelCount     : 2,
      echoCancellation : true,
      latency          : 3.0,
      noiseSuppression : true,
      sampleRate       : 16000,
      sampleSize       : 16,
      volume           : 1.0,
    };
  },
  computed : {
    id() {
      return this.sampleRate + this.sampleSize + this.channelCount;
    },
  },
  methods : {
    toObject() {
      return {
        autoGainControl  : this.autoGainControl,
        channelCount     : this.channelCount,
        echoCancellation : this.echoCancellation,
        latency          : this.latency,
        noiseSuppression : this.noiseSuppression,
        sampleRate       : this.sampleRate,
        sampleSize       : this.sampleSize,
        volume           : this.volume,
      };
    },
  },
});
