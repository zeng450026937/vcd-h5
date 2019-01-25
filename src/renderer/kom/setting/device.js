import rtc from '../../rtc';
import { exp, load, save, gen } from './common';

const device = {
  data() {
    const videoQualityList = [
      rtc.media.genVideoQuality({
        label  : '超清（1080P30fps）',
        height : 1080,
        width  : 1920,
      }),
      rtc.media.genVideoQuality({
        label     : '高清（720P30fps） -- 默认',
        height    : 720,
        width     : 1280,
        recommend : true,
      }),
      rtc.media.genVideoQuality({
        label  : '流畅（360P30fps）',
        height : 360,
        width  : 640,
      }),
    ];

    const shareQualityList = [
      rtc.media.genVideoQuality({
        label  : '超清（1080P30fps）',
        height : 1080,
        width  : 1920,
      }),
      rtc.media.genVideoQuality({
        label     : '超清（1080P15fps）',
        frameRate : 15,
        height    : 1080,
        width     : 1920,
        recommend : true,
      }),
      rtc.media.genVideoQuality({
        label     : '超清（1080P5fps） -- 默认',
        frameRate : 5,
        height    : 1080,
        width     : 1920,
      }),
      rtc.media.genVideoQuality({
        label  : '高清（720P30fps）',
        height : 720,
        width  : 1280,
      }),
    ];

    const sampleRateList = [ 8000, 16000, 32000, 48000 ]; // 采样率
    const sampleSizeList = [ 8, 16, 32 ]; // 采样大小

    const languageList = [
      { label: '简体中文', key: 'zh-CN' },
      { label: 'English', key: 'en' },
      { label: 'Русский', key: 'ru-RU' },
      { label: 'Español', key: 'es' },
      { label: 'Portuguese', key: 'pt' },
      { label: 'Polski', key: 'pl' },
    ];

    return {
      languageList,
      videoQualityList,
      shareQualityList,
      sampleRateList,
      sampleSizeList,
      audioOutputDevice : {},
      muteVideo         : false,
      notification      : true,
      forceLocalStream  : false,
    };
  },

  computed : {
    userName() {
      return rtc.account.username;
    },
    videoInput : {
      get() {
        const { videoDevice } = rtc.media.localMedia;

        return videoDevice && videoDevice.id;
      },
      set(val) {
        const d = this.findDevice(val, this.videoInputList);

        if (!d) return;

        rtc.media.localMedia.videoDevice = d;
      },
    },
    audioInput : {
      get() {
        const { audioDevice } = rtc.media.localMedia;

        return audioDevice && audioDevice.id;
      },
      set(val) {
        const d = this.findDevice(val, this.audioInputList);

        if (!d) return;

        rtc.media.localMedia.audioDevice = d;
      },
    },
    audioOutput : {
      get() {
        this.audioOutputDevice = rtc.media.localMedia.audioOutputDevice || this.audioOutputList[0];

        return this.audioOutputDevice && this.audioOutputDevice.id;
      },
      set(val) {
        const d = this.findDevice(val, this.audioOutputList);

        if (!d) return;
        this.audioOutputDevice = d;
        rtc.media.localMedia.audioOutputDevice = d;
      },
    },
    sampleRate : {
      get() {
        return rtc.media.localMedia.audioQuality.sampleRate;
      },
      set(val) {
        if (!val) return;

        rtc.media.localMedia.audioQuality.sampleRate = val;
      },
    },
    sampleSize : {
      get() {
        return rtc.media.localMedia.audioQuality.sampleSize;
      },
      set(val) {
        if (!val) return;

        rtc.media.localMedia.audioQuality.sampleSize = val;
      },
    },
    autoGainControl : {
      get() {
        return rtc.media.localMedia.audioQuality.autoGainControl;
      },
      set(val) {
        rtc.media.localMedia.audioQuality.autoGainControl = !!val;
      },
    },
    noiseSuppression : {
      get() {
        return rtc.media.localMedia.audioQuality.noiseSuppression;
      },
      set(val) {
        rtc.media.localMedia.audioQuality.noiseSuppression = !!val;
      },
    },
    channelCount : {
      get() {
        return rtc.media.localMedia.audioQuality.channelCount;
      },
      set(val) {
        if (!val) return;
        rtc.media.localMedia.audioQuality.channelCount = val;
      },
    },
    videoInputList() {
      return rtc.media.videoInputs;
    },
    audioInputList() {
      return rtc.media.audioInputs;
    },
    audioOutputList() {
      return rtc.media.audioOutputs;
    },

    videoQuality : {
      get() {
        const { videoQuality } = rtc.media.localMedia;

        return videoQuality && videoQuality.id;
      },
      set(val) {
        const q = this.findQuality(val, this.videoQualityList);

        if (!q) return;
        rtc.media.localMedia.videoQuality = q;
      },
    },
    shareQuality : {
      get() {
        const { videoQuality } = rtc.media.screenMedia;

        return videoQuality && videoQuality.id;
      },
      set(val) {
        const q = this.findQuality(val, this.shareQualityList);

        if (!q) return;
        rtc.media.screenMedia.videoQuality = q;
      },
    },
  },

  watch : {
    // 切换用户的时候重新加载设置信息
    userName : 'initSetting',
    videoInputList(val = []) {
      if (val.some((d) => d.id === this.videoInput)) return;
      [ this.videoInput ] = val;
    },
    audioInputList(val = []) {
      if (val.some((d) => d.id === this.audioInput)) return;
      [ this.audioInput ] = val;
    },
    audioOutputList(val = []) {
      if (val.some((d) => d.id === this.audioOutput)) return;
      [ this.audioOutput ] = val;
    },
  },

  created() {
    this.initSetting();
  },

  methods : {
    async initSetting() {
      // init default quality
      rtc.media.localMedia.videoQuality = this.videoQualityList.find((q) => !!q.recommend);
      rtc.media.screenMedia.videoQuality = this.shareQualityList.find((q) => !!q.recommend);

      rtc.media.localMedia.audioQuality = rtc.media.genAudioQuality({});

      // make sure
      await rtc.media.detectDevice();

      // load configuration
      this.load();
    },
    findDevice(id, list = rtc.media.deviceList) {
      return list.find((d) => d.id === id);
    },
    findQuality(id, list = this.videoQualityList) {
      return list.find((q) => q.id === id);
    },
    load(config) {
      load(this, config, 'device');
    },
    save(data = {}, userName) {
      save(this, data, userName, 'device');
    },
    getConfig(userName) {
      return gen(userName, 'device');
    },
    export() {
      return exp(this, 'device');
    },
  },
};

export default device;
