import Vue from 'vue';

export const Analyser = Vue.extend({
  data() {
    return {
      stream: null,
      enable: false,
    };
  },
  watch: {
    enable(val) {
      if (!val) {
        this.stop();

        return;
      }

      this.start();
    },
    stream(val) {
      // temporarily stop timer if stream is null
      if (!val && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      if (val && !this.timer) {
        this.timer = setInterval(this.analyse, this.interval);
      }
    },
  },
  methods: {
    analyse() {},

    start() {
      this.stop();

      this.$nextTick(this.analyse);

      this.timer = setInterval(this.analyse, this.interval);

      this.enable = true;
    },

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      this.enable = false;
    }
  },

  created() {
    this.timer = null;
    this.interval = 100;
  },

  destroyed() {
    this.stop();
  },
});

export default Analyser;