import Vuem from '../../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      enableHDVideo   : false,
      enableHWSpeed   : true,
      disableVideo    : true,
      enableMirroring : true,
    };
  },
});
model._storageList = [ 'localstorage' ];
export default model;
