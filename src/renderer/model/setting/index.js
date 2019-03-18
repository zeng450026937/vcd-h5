import Vuem from '../vuem';
import updater from '../../updater';
import { moduleList, loadConfig, saveConfig } from './utils';
import device from './device';

const model = new Vuem();

model.provide({
  data() {
    return {
      autoStart     : false,
      hideWhenClose : false,
      language      : '',
      conference    : { // 会议模块
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
      },
      common : { // 通用模块
        autoStart     : false,
        forceMinimize : false,
        language      : 'zh-CN',
        address       : '', // 软终端管理平台地址
        updateChannel : updater.channel,
      },
      video : {
        enableHDVideo   : false,
        enableHWSpeed   : true,
        disableVideo    : true,
        enableMirroring : true,
      },
      about : {
        autoUpdate : false,
      },
    };
  },
  created() {
    this.init();
  },
  methods : {
    init(module, config) { // 加载设置信息到系统中
      if (!module) {
        moduleList.forEach((m) => {
          loadConfig(this, config, 'SYS', m);
        });
      }
      else {
        loadConfig(this, config, 'SYS', module);
      }
    },
    save(module, config = {}) { // 保存设置的数据
      saveConfig(this, config, 'SYS', module);
    },
  },
  watch : {
    updateChannel(val) {
      updater.channel = val;
    },
  },
});

// model.use(() => {});

model.mount('device', device);

export default model;
