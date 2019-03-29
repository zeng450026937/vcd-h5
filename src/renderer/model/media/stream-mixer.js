import Vue from 'vue';

const StreamMixer = Vue.extend({
  data() {
    return {
    };
  },

  computed : {
    stream() {
      return this.destination.stream;
    },
  },

  created() {
    this.context = new AudioContext();
    this.destination = this.context.createMediaStreamDestination();
  },

  beforeDestroy() {

  },
});

export default StreamMixer;
