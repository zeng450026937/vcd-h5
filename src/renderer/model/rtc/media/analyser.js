import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      stream : null,
      enable : false,
    };
  },

  watch : {
    enable(val) {
      if (!val) return this.stop();

      this.start();
    },

    stream(val) {
      if (!val && this.timer) return this.stop();

      if (this.enable && !this.timer) {
        this.start();
      }
    },
  },

  methods : {
    analyse() {},

    start() {
      if (!this.stream) return;

      this.$nextTick().then(() => this.analyse());

      this.timer = setInterval(() => this.analyse(), this.interval);
    },

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },

  created() {
    this.timer = null;
    this.interval = 100;
  },

  beforeDestroy() {
    this.stop();
  },
});
