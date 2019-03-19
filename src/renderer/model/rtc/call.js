import Vue from 'vue';
import { MediaChannel } from 'apollosip';

export const Call = Vue.extend({
  data() {
    return {
      channels : {
        incoming : [],
        holded   : [],
        refered  : [],
      },
    };
  },

  computed : {},
});

export default Call;
