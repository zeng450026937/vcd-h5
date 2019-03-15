import Vuem from 'vuem';
import rtc from '../../rtc';
import { loadConfig, saveConfig } from './utils';

const model = new Vuem();

model.provide({
  data() {
    return {
      videoInputId  : '',
      audioInputId  : '',
      audioOutputId : '',
    };
  },
  created() {
    this.init('device');
  },
  computed : {
    videoInputList() {
      return rtc.media.videoInputs;
    },
    audioInputList() {
      return rtc.media.audioInputs;
    },
    audioOutputList() {
      return rtc.media.audioOutputs;
    },
    videoInput : { // 视频
      get() {
        let device = this.findDevice(this.videoInputId, this.videoInputList);

        if (!device) {
          device = rtc.media.localMedia.videoDevice;
          this.videoInputId = device && device.id;
        }
        rtc.media.localMedia.videoDevice = device;

        
        return this.videoInputId;
      },
      set(val) {
        this.videoInputId = val;
        const device = this.findDevice(val, this.videoInputList);

        if (!device) return;
        rtc.media.localMedia.videoDevice = device;
      },
    },

    audioInput : { // 音频
      get() {
        let device = this.findDevice(this.audioInputId, this.audioInputList);

        if (!device) {
          device = rtc.media.localMedia.audioDevice;
          this.audioInputId = device && device.id;
        }
        rtc.media.localMedia.audioDevice = device;
        
        return this.audioInputId;
      },
      set(val) {
        this.audioInputId = val;
        const device = this.findDevice(val, this.audioInputList);

        if (!device) return;
        rtc.media.localMedia.audioDevice = device;
      },
    },

    audioOutput : { // 扬声器
      get() {
        let device = this.findDevice(this.audioOutputId, this.audioOutputList);

        if (!device) {
          device = this.audioOutputList.length > 0 && this.audioOutputList[0];
          this.audioOutputId = device && device.id;
        }
        
        return this.audioOutputId;
      },
      set(val) { // TODO 设置到 Video 标签的元素上
        this.audioInputId = val;
      },
    },

  },
  methods : {
    init(module, config) { // 加载设置信息到系统中
      loadConfig(this, config, 'SYS', module);
    },
    save(module = 'device', config = {}) { // 保存设置的数据
      saveConfig(this, config, 'SYS', module);
    },
    findDevice(id, list = rtc.media.deviceList) {
      return id && list.find((d) => d.id === id);
    },
  },
});

export default model;
