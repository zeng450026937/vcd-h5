import Vuem from 'vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      minWindowWhenSharing         : true, // 发送内容共享时最小化VCD窗口
      maxWindowWhenWatchingSharing : true, // 观看他人内容共享时自动最大化VCD窗口
      enableGpu                    : true, // 屏幕共享时启用GPU加速
      shareComputerSound           : false, // 共享电脑声音
      preferredPictureFluency      : false, // 画面流畅度优先
      autoSilence                  : false, //
      noticeWhenLeaving            : false,
      noticeOnlyJoiner             : false,
      noticeBoth                   : false,
      noticeAll                    : false,
      advanceEntryTime             : 5,
      instanceMeetingPassword      : false,
      reserveMeetingPassword       : false,
      isRandomPassword             : false,
      isCustomPassword             : false,
      customPassword               : '',
      dndWhenCalling               : false,
      loginSelector                : false,
    };
  },
  watch : {
    noticeWhenLeaving(val) {
      if (!val) {
        this.noticeOnlyJoiner = false;
        this.noticeBoth = false;
        this.noticeAll = false;
      }
    },
    reserveMeetingPassword(val) {
      if (!val) {
        this.isRandomPassword = false;
        this.isCustomPassword = false;
      }
    },
    isCustomPassword(val) {
      if (val) { this.isRandomPassword = false; }
    },
    isRandomPassword(val) {
      if (val) { this.isCustomPassword = false; }
    },
  },
});
model._storageList = [ 'localstorage' ];
export default model;
