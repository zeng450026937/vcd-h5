import bowser from 'bowser';
import VideoDevice from './VideoDevice';

export default VideoDevice.extend({
  data() {
    return {
      kind   : 'videoinput',
      source : 'desktop',
    };
  },
  computed : {
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
        constraints = VideoDevice.options.computed.constraints.call(this);
      }

      if (bowser.firefox) {
        constraints.mozMediaSource = this.source;
        constraints.mediaSource = this.source;
      }

      return constraints;
    },
  },
});
