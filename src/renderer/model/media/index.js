import Vuem from '../vuem';
import { getUserMedia } from '../../lib/get-user-media';
import MediaDevice from './media-device';

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
    audioInputDevice(device) {
      this.setting.audioInputDevice = device;
      this.localMedia.audioDevice = device;
    },
    audioInputDevices(devices) {
      const [ device ] = devices;
      const using = this.audioInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
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
      const using = this.videoInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
      // can't find setting device, use the first one
      if (!hasUsing) {
        this.audioOutputDevice = device;
      }
    },
    videoInputDevice(device) {
      this.setting.videoInputDevice = device;
      this.localMedia.videoDevice = device;
    },
    videoInputDevices(devices) {
      const [ device ] = devices;
      const using = this.videoInput;

      const hasUsing = devices.some((d) => (d.deviceId === using && using.deviceId)
        && (d.groupId === using && using.groupId));
      
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
      this.setting.videoQuality = quality;
      this.localMedia.videoQuality = quality;
    }, 
  },

  methods : {
    detectDevice() {
      return navigator.mediaDevices.enumerateDevices()
        .then((deviceList) => this.deviceList = deviceList.map((d) => d.toJSON()))
        .catch((error) => logger.warn('enumerate devices error: %s', error));
    },

    // get media stream with setting constraints 
    getUserMedia(constraints) {
      return getUserMedia(constraints || this.genConstraints());
    },

    genConstraints() {
      const constraints = {};

      if (this.audioInputDevice) {
        constraints.audio = Object.assign({}, this.audioInputDevice);
      }
      if (this.videoInputDevice) {
        constraints.video = Object.assign({}, this.videoInputDevice);
      }
      if (constraints.audio && this.audioQuality) {
        Object.assign(constraints.audio, this.audioQuality);
      }
      if (constraints.video && this.videoQuality) {
        Object.assign(constraints.video, this.videoQuality);
      }

      return constraints;
    },

    getDisplayMedia(sourceId) {
      const constraints = {
        audio : false,
        video : this.toScreenConstraints({
          sourceId,
          ...this.screenQuality,
        }), 
      };

      return this.getUserMedia(constraints);
    },

    toScreenConstraints(constraints) {
      const mandatory = {
        // desktop for chrome & screen for firefox
        chromeMediaSource   : 'desktop',
        chromeMediaSourceId : constraints.deviceId || constraints.sourceId,
        // minWidth            : constraints.width,
        maxWidth            : constraints.width,
        // minHeight           : constraints.height,
        maxHeight           : constraints.height,
        minFrameRate        : constraints.frameRate,
        maxFrameRate        : constraints.frameRate,
      };
      const optional = [
        { googTemporalLayeredScreencast: true },
      ];

      return {
        mandatory,
        optional,
      };

      /* for firefox
      return {
        mozMediaSource : 'screen',
        mediaSource    : 'screen',
      };
      */
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
