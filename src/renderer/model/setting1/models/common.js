import Vuem from '../../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      autoStart     : false,
      forceMinimize : false,
      language      : 'zh-CN',
      address       : '', // 软终端管理平台地址
      updateChannel : 'stable',
    };
  },
  watch : {
    language(val) {
      
    },
  },
});
model._storageList = [ 'localstorage' ];
export default model;
