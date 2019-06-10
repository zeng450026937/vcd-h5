import Vue from 'vue';
import VueStorage from './lib';
import { LOGIN_STORAGE, CONTACT_STORAGE, SETTING_STORAGE } from './constants';

Vue.use(VueStorage);

const storage = new VueStorage({
  dbName  : 'vcd_h5',
  version : 'V1', // 可能会保存多版本的数据信息
  storage : [
    { // 登录的用户 YMS
      store   : LOGIN_STORAGE.ACCOUNT_LIST,
      type    : Array,
      key     : 'id',
      default : [],
      autoKey : true,
    },
    { // 登录的用户 YMS
      store   : LOGIN_STORAGE.MEETING_ACCOUNT_LIST,
      type    : Array,
      key     : 'id',
      default : [],
      autoKey : true,
    },
    { // 登录的用户 YMS
      store   : LOGIN_STORAGE.ANON_MEETING_ACCOUNT_LIST,
      type    : Array,
      key     : 'id',
      default : [],
      autoKey : true,
    },
    { // 服务器类型
      store   : LOGIN_STORAGE.SERVER_TYPE,
      type    : String,
      default : 'cloud', // cloud yms
    },
    { // 是否记住密码
      store   : LOGIN_STORAGE.REMEMBER_PASSWORD,
      type    : Boolean,
      default : true, // cloud yms
    },
    { // 是否记住密码
      store   : LOGIN_STORAGE.PUSH_URL,
      type    : String,
      default : 'http://10.120.3.59:9444', // cloud yms
    },
    { // 是否自动登录
      store   : LOGIN_STORAGE.AUTO_LOGIN,
      type    : Boolean,
      default : false, // cloud yms
    },
    { // 本地联系人
      store   : CONTACT_STORAGE.LOCAL_CONTACT,
      type    : Array,
      key     : 'id',
      default : [],
    },
    { // 本地联系人
      store   : 'CURRENT_ACCOUNT',
      type    : Object,
      key     : 'id',
      default : {},
    },
    { // 本地联系人
      store   : 'FIRST_START',
      type    : Boolean,
      default : true,
    },
    {
      store   : SETTING_STORAGE.SETTING,
      type    : Object,
      default : {},
    },
  ],
});

export { LOGIN_STORAGE, CONTACT_STORAGE, SETTING_STORAGE };

if (process.env.NODE_ENV === 'development') {
  window.storage = storage;
}
export default storage;
