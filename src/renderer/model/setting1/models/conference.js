import Vuem from '../../vuem';

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
      selectedNotice               : 1, // 1:仅入会方  2：入会方+主持人  3：all
      advanceEntryTime             : 5,
      instanceMeetingPassword      : false,
      reserveMeetingPassword       : false,
      isRandomOrCustom             : 1,
      customPassword               : '',
      dndWhenCalling               : false,
      loginSelector                : false,
    };
  },
  watch : {
    
  },
});
model._storageList = [ 'localstorage' ];
export default model;
