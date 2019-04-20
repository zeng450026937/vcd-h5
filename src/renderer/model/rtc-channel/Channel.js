import Vue from 'vue';
import { Call as Channel } from 'apollosip';

export default Vue.extend({
  data() {
    return {
      // private
      channel : null,

      // public
      status         : 'finished',
      localStream    : null,
      remoteStream   : null,
      localIdentity  : null,
      remoteIdentity : null,
      direction      : null,
    };
  },

  methods : {
    connect() {

    },
    disconnect() {

    },
    receive() {

    },
    hold() {

    },
    unhold() {

    },
    getStats() {

    },
  },
  created() {
    const channel = new Channel();

    channel._isVue = true;
    this.channel = channel;
  },
  destroyed() {
    this.channel.disconnect();
    this.channel.ua = null;
    this.channel = null;
  },
});
