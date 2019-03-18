import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      autoUpdate : false,
    };
  },
});

model._storageList = [ 'localstorage' ];

export default model;
