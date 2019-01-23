import { load, save, exp, gen } from './common';

export default {
  data() {
    return {
      labelList     : [],
      serverAddress : '10.200.112.165',
      serverPort    : '7777',
      sipServerPort : '5061', // sip 服务器端口 默认 5061
    };
  },
  created() {
    this.init();
  },
  computed : {
    testServerInfo() {
      return {
        address : this.serverAddress,
        port    : this.serverPort,
      };
    },
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'normal', 'DEVICE');
    },
    save(config = {}) { // 保存设置的数据 // normal setting is device sttr no userName
      save(this, config, 'DEVICE', 'normal');
    },
    export() { // 导出配置信息
      return exp(this, 'normal');
    },
    getConfig() { // normal setting is device sttr no userName
      return gen('DEVICE', 'normal');
    },
  },
};
