import { load, save, exp, gen } from './common';

export default {
  data() {
    return {
      autoUpdate : false,
    };
  },
  created() {
    this.init();
  },
  computed : {
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'about', 'SYS');
    },
    save(config = {}) { // 保存设置的数据 // normal setting is device sttr no userName
      save(this, config, 'SYS', 'about');
    },
    export() { // 导出配置信息
      return exp(this, 'about');
    },
    getConfig() { // normal setting is device sttr no userName
      return gen('SYS', 'about');
    },
  },
};
