import rtc from '../../rtc';
import { load, save, exp, gen } from './common';

const call = {
  data() {
    return {
      autoAnswer : false, // 自动接听
      enableDND  : false, // 请勿打扰
    };
  },
  created() {
    this.init();
  },
  computed : {
    userName() {
      return rtc.account.username;
    },
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'call');
    },
    save(data = {}, userName) { // 保存设置的数据
      save(this, data, userName, 'call');
    },
    export() { // 导出配置信息
      return exp(this, 'call');
    },
    getConfig(userName) {
      return gen(userName, 'call');
    },
  },
  watch : {
    // 切换用户的时候重新加载设置信息
    userName() {
      this.init();
    },
    autoAnswer(val) {
      rtc.call.autoAnswer = val;
    },
    enableDND(val) {
      rtc.call.enableDND = val;
    },
  },
};

export default call;
