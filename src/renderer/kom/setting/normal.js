import { load, save, exp, gen } from './common';
import updater from '../../updater';

export default {
  data() {
    return {
      autoStart     : false,
      forceMinimize : false,
      language      : 'zh-CN',
      address       : '', // 软终端管理平台地址
      updateChannel : updater.channel,
    };
  },
  created() {
    this.init();
  },
  watch : {
    updateChannel(val) {
      updater.channel = val;
    },
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
