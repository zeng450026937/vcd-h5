import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      kind  : '',
      label : '',
    };
  },
  computed : {
    id() {
      return this.kind + this.label;
    },
  },
  methods : {
    toObject() {},
  },
});
