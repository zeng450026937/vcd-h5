import bowser from 'bowser';
import Vue from 'vue';
import Device from './Device/Device';
import AudioDevice from './Device/AudioDevice';
import VideoDevice from './Device/VideoDevice';
import ScreenDevice from './Device/ScreenDevice';
import MediaDevice from './MediaDevice';
import AudioQuality from './Quality/AudioQuality';
import VideoQuality from './Quality/VideoQuality';
import { getLogger } from '../Utils';

const logger = getLogger('Media');

const api = 'ylGetScreen';
let api_listener = null;

let featureDetectionAudioElement = document.createElement('audio');
const audioOutputChangeable = typeof featureDetectionAudioElement.setSinkId !== 'undefined';

featureDetectionAudioElement = null;

export {
  AudioQuality,
  VideoQuality,
  AudioDevice,
  VideoDevice,
  ScreenDevice,
  MediaDevice,
};

export default Vue.extend({
  data() {
    return {
      audioOutputChangeable,
      rawDevices     : [],
      deviceList     : [],
      detectTimer    : null,
      detectInterval : 3000,
      localMedia     : null,
      screenMedia    : null,
      audioPlayer    : null,
    };
  },
  computed : {
    audioInputs() {
      return this.deviceList.filter((d) => d.kind === 'audioinput');
    },
    audioOutputs() {
      return this.deviceList.filter((d) => d.kind === 'audiooutput');
    },
    videoInputs() {
      return this.deviceList.filter((d) => d.kind === 'videoinput');
    },
  },
  watch : {
    rawDevices(devices) {
      this.deviceList = devices.map((device) => {
        /* eslint-disable no-unused-vars */
        const [ kind, type, direction ] = device.kind.match(/(\w+)(input|output)/i);
        /* eslint-enable no-unused-vars */
        // logger.warn(`DEVICE\n- type: ${type}\n- direction: ${direction}\n- label: ${device.label}\n`);
        let d;

        switch (kind) {
          case 'audioinput':
            d = new AudioDevice(device);
            break;
          case 'videoinput':
            d = new VideoDevice(device);
            break;
          case 'audiooutput':
            d = new Device(device);
            break;
          default:
            d = new Device(device);
            break;
        }

        d.deviceId = device.deviceId;
        d.groupId = device.groupId;
        d.kind = device.kind;
        d.label = device.label;

        return d;
      });
    },
    audioInputs(devices) {
      const [ device ] = devices;
      const using = this.localMedia.audioDevice;
      const hasUsing = devices.some((d) => d.id === using && using.id);
      
      if (!hasUsing) {
        this.localMedia.audioDevice = device;
      }
    },
    videoInputs(devices) {
      const [ device ] = devices;
      const using = this.localMedia.videoDevice;
      const hasUsing = devices.some((d) => d.id === using && using.id);
      
      if (!hasUsing) {
        this.localMedia.videoDevice = device;
      }
    },
  },
  created() {
    this.localMedia = new MediaDevice();
    this.screenMedia = new MediaDevice();

    this.detectDevice();

    this.$data.devicechangeHandler = this.detectDevice.bind(this);

    if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
      logger.warn('Device change event is not supported.');

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

            if (deviceChanged) { this.rawDevices = deviceList; }

            function stringifyDeviceList(list) {
              return list.map((d) => JSON.stringify({
                kind     : d.kind,
                deviceId : d.deviceId || d.id,
                groupId  : d.groupId,
                label    : d.label,
              })).sort()
                .join('');
            }
          })
          .catch((error) => logger.error('error: %o', error));
      }, this.interval);
    }
    else {
      navigator.mediaDevices.addEventListener('devicechange', this.$data.devicechangeHandler);
    }
  },
  destroyed() {
    if (this.detectTimer) {
      clearInterval(this.detectTimer);
      this.detectTimer = null;
    }

    if (navigator.mediaDevices.removeEventListener !== 'undefined') {
      navigator.mediaDevices.removeEventListener('devicechange', this.$data.devicechangeHandler);
    }
  },
  methods : {
    detectDevice() {
      return navigator.mediaDevices.enumerateDevices()
        .then((deviceList) => this.rawDevices = deviceList)
        .catch((error) => logger.error('error: %o', error));
    },

    genAudioQuality(data) {
      return new AudioQuality({
        data,
      });
    },
    genVideoQuality(data) {
      return new VideoQuality({
        data,
      });
    },

    selectScreen(sourceId) {
      return Promise.resolve()
        .then(() => {
          if (sourceId && sourceId !== '') {
            const device = new ScreenDevice();

            device.source = 'desktop';
            device.deviceId = sourceId;
            
            return Promise.resolve(device);
          }

          return new Promise((resolve, reject) => {
            if (bowser.firefox) {
              const device = new ScreenDevice();

              device.source = 'screen';

              resolve(device);
            }
            else if (bowser.chrome) {
              const pending = window.setTimeout(() => {
                window.removeEventListener('message', api_listener);
                api_listener = null;
                reject(new Error('No Extension Tool'));
              }, 2000);

              api_listener = (event) => {
                if (event.origin !== window.location.origin) {
                  return;
                }
                if (event.data.type === `${api}Done`) {
                  ({ sourceId } = event.data);

                  window.removeEventListener('message', api_listener);
                  api_listener = null;

                  if (sourceId && sourceId !== '') {
                    const device = new ScreenDevice();

                    device.source = 'desktop';
                    device.deviceId = sourceId;
                    resolve(device);
                  }
                  else {
                    reject(new Error('User Canceled'));
                  }
                }
                else if (event.data.type === `${api}Pending`) {
                  window.clearTimeout(event.data.id);
                }
              };
              window.addEventListener('message', api_listener);
              window.postMessage({ type: api, id: Number(pending) }, '*');
            }
          });
        })
        .then((device) => {
          // set screen device as video device into screen media
          this.screenMedia.videoDevice = device;

          return device;
        });
    },
  },
});
