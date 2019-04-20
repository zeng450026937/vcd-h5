import Vuem from '../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      currentChannel   : null,
      heldChannels     : [],
      incomingChannels : [],
    };
  },
  middleware : {
    async switch(ctx, next) {
      await next();
    },
    async hold(ctx, next) {
      await next();
    },
    async unHold(ctx, next) {
      await next();
    },
    async refer(ctx, next) {
      await next();
    },
  },
  created() {
    this.$data.handlers = {
      newRTCSession : (data) => {
        if (data.originator !== 'remote') return;
        if (data.session._is_refer) return; // is refer refer
        if (!data.request.sdp) {
          data.request.parseSDP();
        }
      },
    };
  },
});

export default model;
