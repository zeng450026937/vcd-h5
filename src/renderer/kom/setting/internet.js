import { load, save, exp, gen } from './common';
import rtc from '../../rtc';

const internet = {
  data() {
    return {
      forceRelay          : false,
      reconnectTestServer : true,
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
      load(this, config, 'net');
    },
    save(data = {}, userName) { // 保存设置的数据
      save(this, data, userName, 'net');
    },
    export() { // 导出配置信息
      return exp(this, 'net');
    },
    getConfig(userName) {
      return gen(userName, 'net');
    },
  },
  watch : {
    // 切换用户的时候重新加载设置信息
    userName() {
      this.init();
    },
    forceRelay(force) {
      if (rtc.account.ua) {
        if (force) {
          rtc.account.ua.set('iceTransportPolicy', 'relay');
        }
        else {
          rtc.account.ua.set('iceTransportPolicy', 'all');
        }
      }
    },
  },
};

export default internet;
