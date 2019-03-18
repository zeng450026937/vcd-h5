import Vuem from 'vuem';
import updater from '../../../updater';

const model = new Vuem();

model.provide({
  data() {
    return {
      autoStart     : false,
      forceMinimize : false,
      language      : 'zh-CN',
      address       : '', // 软终端管理平台地址
      updateChannel : updater.channel,
    };
  },
  watch : {
    language(val) {
      
    },
  },
});
model._storageList = [ 'localstorage' ];
export default model;
