import { load, save, exp, gen } from './common';

const conference = {
  data() {
    return {
      minWindowWhenSharing         : true, // 发送内容共享时最小化VCD窗口
      maxWindowWhenWatchingSharing : true, // 观看他人内容共享时自动最大化VCD窗口
      enableGpu                    : true, // 屏幕共享时启用GPU加速
      shareComputerSound           : false, // 共享电脑声音
      preferredPictureFluency      : false, // 画面流畅度优先
      autoSilence                  : false, //
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
