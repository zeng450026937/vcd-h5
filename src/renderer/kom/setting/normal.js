import { load, save, exp, gen } from './common';

export default {
  data() {
    return {
      autoStart     : false,
      forceMinimize : false,
      language      : 'zh-CN',
      address       : '', // 软终端管理平台地址
    };
  },
  created() {
    this.init();
  },
  computed : {
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'normal', 'SYS');
    },
    save(config = {}) { // 保存设置的数据 // normal setting is device sttr no userName
      save(this, config, 'SYS', 'normal');
    },
    export() { // 导出配置信息
      return exp(this, 'normal');
    },
    getConfig() { // normal setting is device sttr no userName
      return gen('SYS', 'normal');
    },
  },
};
