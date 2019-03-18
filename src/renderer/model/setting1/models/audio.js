import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
    };
  },
});
model._storageList = [ 'localstorage' ];
export default model;
