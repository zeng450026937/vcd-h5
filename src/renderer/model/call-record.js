import Vuem from './vuem';

const model = new Vuem();

model.provide({
  data() {
    return {};
  },

  methods : {
    onOutgoing() {},

    onIncoming() {},

    onRefuse() {},
    
    onNoAnswer() {},
    
    onHangup() {},
    
    onRefer() {},

    onReplace() {},
  },
});

export default model;
