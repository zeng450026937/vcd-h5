import Vuem from '../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      deviceList     : [],
      detectInterval : 3000,
    };
  },
  computed : {
    audioInputs() {
      return this.deviceList.filter((d) => d.kind === 'audioinput');
    },
    audioOutputs() {
      return this.deviceList.filter((d) => d.kind === 'audiooutput');
    },
    videoInputs() {
      return this.deviceList.filter((d) => d.kind === 'videoinput');
    },
  },
  methods : {
  },
});

export default model;
