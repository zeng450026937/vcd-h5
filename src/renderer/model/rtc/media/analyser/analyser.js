import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      stream   : null,
      interval : 100,
      enable   : false,
      timer    : null,
    };
  },
  watch : {
    enable : 'onEnableChanged',
    stream : 'onEnableChanged',
  },
  methods : {
    analyse() {},
    onEnableChanged() {
      if (this.enable && this.stream) {
        this.$nextTick(() => {
          this.analyse();
        });

        this.timer = setInterval(() => {
          this.analyse();
        }, this.interval);
      }
      else
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
});
