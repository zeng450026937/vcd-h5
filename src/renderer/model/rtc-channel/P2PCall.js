import Vue from 'vue';
import CallShareChannel from './CallShareChannel';
import Channel from './Channel';

export default Vue.extend({
  data() {
    return {
      // media
      mediaChannel : null,
      shareChannel : null,
    };
  },
  methods : {
    refer() {

    },
    answer() {

    },
    decline(channel) {

    },
    switch(channel) {

    },
    upgrade(participants, info = {}) {

    },
    sendDTMF(tones, options) {

    },
  },
  created() {
    this.mediaChannel = new Channel({ parent: this });
    this.shareChannel = new CallShareChannel({ parent: this });
  },
});
