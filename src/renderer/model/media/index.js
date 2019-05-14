import { debounce } from 'lodash';
import Vuem from '../vuem';
import { getUserMedia } from '../../lib/get-user-media';
import MediaDevice from './media-device';
import rtc from '../../rtc';

function stringifyDevice(device) {
  return JSON.stringify({
    kind     : device.kind,
    deviceId : device.deviceId,
    groupId  : device.groupId,
    label    : device.label,
  });
}

function stringifyDeviceList(list) {
  return list.map((d) => stringifyDevice(d)).sort().join('');
}

// FIXME: maybe we should only check deviceId & groupId
function isSameDevice(a, b) {
  return a.deviceId === b.deviceId
    && a.label === b.label
    && a.kind === b.kind;
}

const model = new Vuem();

model.provide({
  data() {
    return {
      deviceList        : [],
      audioInputDevice  : null,
      audioOutputDevice : null,
      videoInputDevice  : null,
      audioQuality      : {        
        autoGainControl  : true,
        channelCount     : 2,
        echoCancellation : true,
        latency          : 3.0,
        noiseSuppression : true,
        sampleRate       : 48000,
        sampleSize       : 32,
      },
      videoQuality : {
        aspectRatio : 16 / 9,
        frameRate   : 30,
        height      : 720,
        width       : 1280,
      },
      screenQuality : {
        aspectRatio : 16 / 9,
        frameRate   : 30,
        height      : 720,
        width       : 1280,
      },
    };
  },

  computed : {
    // TODO: move audioInputDeviceId to ui or somewhere
    audioInputDeviceId : {
      get() {
        if (!this.audioInputDevice) return null;

        return this.audioInputDevice.deviceId;
      },
      set(val) {
        this.audioInputDevice = this.audioInputDevices.find((d) => d.deviceId === val);
      },
    },
    audioInputDevices() {
      return this.deviceList.filter((d) => d.kind === 'audioinput');
    },

    // TODO: move audioOutputDeviceId to ui or somewhere
    audioOutputDeviceId : {
      get() {
        if (!this.audioOutputDevice) return null;

        return this.audioOutputDevice.deviceId;
      },
      set(val) {
        this.audioOutputDevice = this.audioOutputDevices.find((d) => d.deviceId === val);
      },
    },
    audioOutputDevices() {
      return this.deviceList.filter((d) => d.kind === 'audiooutput');
    },

    // TODO: move videoInputDeviceId to ui or somewhere
    videoInputDeviceId : {
      get() {
        if (!this.videoInputDevice) return null;

        return this.videoInputDevice.deviceId;
      },
      set(val) {
        this.videoInputDevice = this.videoInputDevices.find((d) => d.deviceId === val);
      },
    },
    videoInputDevices() {
      return this.deviceList.filter((d) => d.kind === 'videoinput');
    },
  },

  watch : {
    audioInputDevice(device) {
      this.setting.audioInputDevice = device;
      this.localMedia.audioDevice = device;
      rtc.media.localMedia.audioDevice = rtc.media.toAudioDevice(device);
    },
    audioInputDevices(devices) {
      const [ device ] = devices;
      const using = this.audioInputDevice;

      const hasUsing = using && devices.some((d) => isSameDevice(d, using));
      
      // can't find setting device, use the first one
      if (!hasUsing) {
        this.audioInputDevice = device;
      }
    },
    audioOutputDevice(device) {
      this.setting.audioOutputDevice = device;
      this.localMedia.videoDevice = device;
    },
    audioOutputDevices(devices) {
      const [ device ] = devices;
      const using = this.audioOutputDevice;

      const hasUsing = using && devices.some((d) => isSameDevice(d, using));

      // can't find setting device, use the first one
      if (!hasUsing) {
        this.audioOutputDevice = device;
      }
    },
    videoInputDevice(device) {
      this.setting.videoInputDevice = device;
      this.localMedia.videoDevice = device;
      rtc.media.localMedia.videoDevice = rtc.media.toVideoDevice(device);
    },
    videoInputDevices(devices) {
      const [ device ] = devices;
      const using = this.videoInputDevice;

      const hasUsing = using && devices.some((d) => isSameDevice(d, using));

      // can't find setting device, use the first one
      if (!hasUsing) {
        this.videoInputDevice = device;
      }
    },

    audioQuality(quality) {
      this.setting.audioQuality = quality;
      this.localMedia.audioQuality = quality;
    }, 
    videoQuality(quality) {
      this.setting.audioQuality = quality;
      this.localMedia.videoQuality = quality;
    }, 
    screenQuality(quality) {
      this.setting.screenQuality = quality;
    }, 
  },

  middleware : {
    async getUserMedia(ctx, next) {
      await next();

      const { constraints } = ctx.payload;

      const stream = await this.getUserMedia(constraints);

      return stream;
    },

    async getDisplayMedia(ctx, next) {
      await next();

      const { sourceId, audio } = ctx.payload;

      const stream = await this.getDisplayMedia(sourceId, audio);

      return stream;
    },
  },

  methods : {
    detectDevice : debounce(function detectDevice() {
      return navigator.mediaDevices.enumerateDevices()
        .then((deviceList) => this.deviceList = deviceList.map((d) => d.toJSON()))
        .catch((error) => logger.warn('enumerate devices error: %s', error));
    }, 500),

    // get media stream with setting constraints 
    getUserMedia(constraints) {
      return getUserMedia(constraints || this.genUserConstraints());
    },

    genUserConstraints() {
      const constraints = {};

      if (this.audioInputDevice) {
        constraints.audio = { ...this.audioInputDevice };
      }
      if (this.videoInputDevice) {
        constraints.video = { ...this.videoInputDevice };
      }
      if (constraints.audio && this.audioQuality) {
        Object.assign(constraints.audio, this.audioQuality);
      }
      if (constraints.video && this.videoQuality) {
        Object.assign(constraints.video, this.videoQuality);
      }

      return constraints;
    },

    getDisplayMedia(sourceId, audio = false) {
      let constraints;

      if (typeof sourceId === 'object') {
        constraints = sourceId;
      }
      else {
        constraints = this.genDisplayConstraints(sourceId, audio);
      }

      return this.getUserMedia(constraints);
    },

    genDisplayConstraints(sourceId, audio = false) {
      return this.toDisplayConstraints({
        audio,
        video : { sourceId, ...this.screenQuality },
      });
    },

    getDisplayAudio() {
      return this.getUserMedia(this.toDisplayConstraints({ audio: true }));
    },

    getDisplayVideo(constraints) {
      return this.getUserMedia(this.toDisplayConstraints({ video: constraints }));
    },

    toDisplayConstraints(constraints = {}) {
      const { audio, video } = constraints;

      const displayConstraints = { audio: false, video: false };

      if (audio) {
        const mandatory = { chromeMediaSource: 'desktop' };

        displayConstraints.audio = { mandatory };
      }

      if (video) {
        const mandatory = {
          // desktop for chrome & screen for firefox
          chromeMediaSource   : 'desktop',
          chromeMediaSourceId : video.deviceId || video.sourceId,
          // minWidth            : constraints.width,
          maxWidth            : video.width,
          // minHeight           : constraints.height,
          maxHeight           : video.height,
          minFrameRate        : video.frameRate,
          maxFrameRate        : video.frameRate,
        };
        
        const optional = [
          { googTemporalLayeredScreencast: true },
        ];

        displayConstraints.audio = { mandatory, optional };
      }

      return displayConstraints;
    },
  },

  async created() {
    this.localMedia = new MediaDevice();
    this.localMedia.audioQuality = this.audioQuality;
    this.localMedia.videoQuality = this.videoQuality;

    this.detectTimer = null;
    this.detectInterval = 3000;
    
    if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
      logger.warn('device change event is not supported.');

      this.detectTimer = setInterval(() => {
        navigator.mediaDevices.enumerateDevices()
          .then((deviceList) => {
            let deviceChanged = false;

            if (deviceList.length !== this.deviceList.length) {
              deviceChanged = true;
            }
            else {
              deviceChanged = stringifyDeviceList(deviceList)
                              !== stringifyDeviceList(this.deviceList);
            }

            if (deviceChanged) { this.deviceList = deviceList.map((d) => d.toJSON()); }
          })
          .catch((error) => logger.warn('enumerate devices error: %s', error));
      }, this.detectInterval);
    }
    else {
      navigator.mediaDevices.addEventListener('devicechange', this.detectDevice);
    }

    // model hasn't be fully initilized when created() invoked
    await this.$nextTick();
    // model fully initilized

    // detect device later, ensure setting is loaded
    // async detect
    this.detectDevice();

    const setting = this.$getVM('setting');

    this.audioInputDevice = setting.audioInputDevice;
    this.audioOutputDevice = setting.audioOutputDevice;
    this.videoInputDevice = setting.videoInputDevice;

    setting.$watch(
      'videoQuality',
      (val) => {
        const QUALITY_MAP = {
          '1080P' : { width: 1920, height: 1080 },
          '720P'  : { width: 1280, height: 720 },
          '360P'  : { width: 640, height: 360 },
        };

        const quality = QUALITY_MAP[val] || QUALITY_MAP['720P'];

        this.videoQuality.width = quality.width;
        this.videoQuality.height = quality.height;

        rtc.media.localMedia.videoQuality.width = this.videoQuality.width;
        rtc.media.localMedia.videoQuality.height = this.videoQuality.height;

        let channel = null;

        if (rtc.call.connected) channel = rtc.call.channel;
        if (rtc.conference.connected) channel = rtc.conference.mediaChannel.channel;
        if (channel) rtc.media.localMedia.acquireDetachedStream().then((s) => channel.replaceLocalStream(s));
      },
      { immediate: true }
    );
    setting.$watch(
      'shareSmoothMode',
      (val) => {
        if (val) {
          this.videoQuality.width = 1280;
          this.videoQuality.height = 720;
          this.videoQuality.frameRate = 30;
        }
        else {
          this.videoQuality.width = 1920;
          this.videoQuality.height = 1080;
          this.videoQuality.frameRate = 5;
        }

        rtc.media.screenMedia.videoQuality.width = this.videoQuality.width;
        rtc.media.screenMedia.videoQuality.height = this.videoQuality.height;
        rtc.media.screenMedia.videoQuality.frameRate = this.videoQuality.frameRate;

        // 设置立即生效
        let shareChannel = null;

        if (rtc.conference.shareChannel.channel.localStream) {
          shareChannel = rtc.conference.shareChannel.channel;
        }
        else if (rtc.call.share.channel.localStream) {
          shareChannel = rtc.call.share.channel;
        }
        if (shareChannel) {
          shareChannel.localStream.getTracks().forEach((t) => t.stop());
          rtc.media.screenMedia.acquireDetachedStream().then((s) => shareChannel.replaceLocalStream(s));
        }
      },
      { immediate: true }
    );
    setting.$watch(
      'noiseSuppression',
      (val) => {
        this.audioQuality.noiseSuppression = val;
        rtc.media.localMedia.audioQuality.noiseSuppression = val;
      },
      { immediate: true }
    );

    // saved for later use
    this.setting = setting;
  },

  beforeDestroy() {
    if (this.detectTimer) {
      clearInterval(this.detectTimer);
      this.detectTimer = null;
    }

    if (navigator.mediaDevices.removeEventListener !== 'undefined') {
      navigator.mediaDevices.removeEventListener('devicechange', this.detectDevice);
    }
  },
});

export default model;
