import Vue from 'vue';
import VueStorage from './lib';

Vue.use(VueStorage);

const storage = new VueStorage({
  dbName  : 'apollo_vc',
  version : 'V1', // 可能会保存多版本的数据信息
  storage : [
    { // 登录的用户
      store   : 'ACCOUNT_LIST',
      type    : Array,
      key     : 'id',
      default : [],
    },
    { // 是否自动更新
      store   : 'AUTO_UPDATE',
      type    : Boolean,
      default : false,
    },
    { // 当前设备的唯一标志
      store   : 'DEVICE_UUID',
      type    : String,
      default : '', // UUID(),
    },

    {
      store   : 'DIALER_RECORD_LIST',
      type    : Array,
      key     : 'id',
      default : [],
    },
    {
      store   : 'LOCAL_CONTACT',
      type    : Array,
      key     : 'id',
      default : [],
    },
  ],
});

if (process.env.NODE_ENV === 'development') {
  window.storage = storage;
}
export default storage;
