import { load, save, exp, gen } from './common';

const conference = {
  data() {
    return {
      enableHDVideo   : false,
      enableHWSpeed   : false,
      disableVideo    : false,
      enableMirroring : false,
    };
  },
  created() {
    this.init();
  },
  computed : {
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'video', 'SYS');
    },
    save(data = {}) { // 保存设置的数据
      save(this, data, 'SYS', 'video');
    },
    export() { // 导出配置信息
      return exp(this, 'video');
    },
    getConfig() {
      return gen('SYS', 'video');
    },
  },
  watch : {
  },
};

export default conference;
