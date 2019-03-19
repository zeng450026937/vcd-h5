import bowser from 'bowser';
import { VideoDevice } from './video-device';
import { ScreenQuality } from '../quality/screen-quality';

export class ScreenDevice extends VideoDevice {
  constructor() {
    super();

    this.kind = 'videoinput';
    this.source = 'desktop';
    this.quality = new ScreenQuality();
  }

  constraints() {
    let constraints = {};

    if (bowser.chrome) {
      const mandatory = {
        chromeMediaSource   : this.source,
        chromeMediaSourceId : this.deviceId,
      };

      if (this.quality) {
        Object.assign(mandatory, {
          // minWidth            : this.quality.width,
          maxWidth     : this.quality.width,
          // minHeight           : this.quality.height,
          maxHeight    : this.quality.height,
          minFrameRate : this.quality.frameRate,
          maxFrameRate : this.quality.frameRate,
        });
      }

      const optional = [
        { googTemporalLayeredScreencast: true },
      ];

      constraints.mandatory = mandatory;
      constraints.optional = optional;
    }
    else {
      constraints = super.constraints;
    }

    if (bowser.firefox) {
      constraints.mozMediaSource = this.source;
      constraints.mediaSource = this.source;
    }

    return constraints;
  }

  acquireStream() {
    if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia(this.constraints());
    }

    return Promise.reject();
  }
}
