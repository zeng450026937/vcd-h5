import { load, save, exp, gen } from './common';

const conference = {
  data() {
    return {
      maxWindowWhenSharing         : false,
      maxWindowWhenWatchingSharing : false,
      enableGpu                    : false,
      autoSilence                  : false,
      noticeWhenLeaving            : false,
      advanceEntryTime             : 5,
      instanceMeetingPassword      : false,
      reserveMeetingPassword       : false,
      dndWhenCalling               : false,
    };
  },
  created() {
    this.init();
  },
  computed : {
  },
  methods : {
    init(config) { // 加载设置信息到系统中
      load(this, config, 'conference', 'SYS');
    },
    save(data = {}) { // 保存设置的数据
      save(this, data, 'SYS', 'conference');
    },
    export() { // 导出配置信息
      return exp(this, 'conference');
    },
    getConfig() {
      return gen('SYS', 'conference');
    },
  },
  watch : {
  },
};

export default conference;
