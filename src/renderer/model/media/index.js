import Vuem from '../vuem';
import { closeMediaStream } from '../../lib/close-stream';

function stringifyDeviceList(list) {
  return list.map((d) => JSON.stringify({
    kind     : d.kind,
    deviceId : d.deviceId,
    groupId  : d.groupId,
    label    : d.label,
  })).sort()
    .join('');
}

const model = new Vuem();

model.provide({
  data() {
    return {
      deviceList   : [],
      audioQuality : {        
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
    };
  },

  computed : {
    audioInputDevices() {
      return this.deviceList.filter((d) => d.kind === 'audioinput');
    },
    audioOutputDevices() {
      return this.deviceList.filter((d) => d.kind === 'audiooutput');
    },
    videoInputDevices() {
      return this.deviceList.filter((d) => d.kind === 'videoinput');
    },
  },

  watch : {
    audioInputDevices(devices) {
      const [ device ] = devices;
      const using = this.audioInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
      // can't find setting device, use the first one
      if (!hasUsing) {
        this.setting.audioInputDevice = device;
      }
    },
    audioOutputDevices(devices) {
      const [ device ] = devices;
      const using = this.videoInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
      // can't find setting device, use the first one
      if (!hasUsing) {
        this.setting.audioOutputDevice = device;
      }
    },
    videoInputDevices(devices) {
      const [ device ] = devices;
      const using = this.videoInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
      // can't find setting device, use the first one
      if (!hasUsing) {
        this.setting.videoInputDevice = device;
      }
    },
  },

  methods : {
    detectDevice() {
      return navigator.mediaDevices.enumerateDevices()
        .then((deviceList) => this.deviceList = deviceList)
        .catch((error) => logger.warn('enumerate devices error: %s', error));
    },

    // get media stream with setting constraints 
    getUserMedia() {
      const constraints = {
        audio : { 
          ...this.setting.audioInputDevice,
          ...this.audioQuality,
        },
        video : { 
          ...this.setting.videoInputDevice,
          ...this.videoQuality,
        },
      };

      // add stream.close()
      return navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          stream.close = function() {
            closeMediaStream(this);
          };

          return stream;
        });
    },
  },

  async created() {
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

            if (deviceChanged) { this.deviceList = deviceList; }
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

    setting.$watch(
      'highProfile',
      (val) => {
        if (val) {
          this.videoQuality.width = 1920;
          this.videoQuality.height = 1080;
        }
        else {
          this.videoQuality.width = 1280;
          this.videoQuality.height = 720;
        }
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
