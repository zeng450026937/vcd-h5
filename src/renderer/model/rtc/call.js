import Vuem from '../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
    };
  },

  computed : {
    localStream() {
      return this.channel.localStream;
    },
  },

  middleware : {
    upgrade() {
      this.channel.upgrade();
    },

    invite() {
      this.channel.upgrade();
    },
    mute() {
      this.channel.mute();
    },
    // a1() {
    //
    // },
    // ....
    an() {

    },

  },

  async created() {
    this.channel = null;

    await this.$nextTick();

    const callManager = this.$getVM('callManager');

    callManager.$watch('currentChannel', (val) => {
      this.channel = val;
    });
  },
});

export default model;

call.mute();
