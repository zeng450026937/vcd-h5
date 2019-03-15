import Device from './Device';
import VideoQuality from '../Quality/VideoQuality';

export default Device.extend({
  data() {
    return {
      quality : new VideoQuality(),
    };
  },
  computed : {
    constraints() {
      const constraints = Device.options.computed.constraints.call(this);

      if (this.quality) {
        Object.assign(constraints, this.quality.toObject());
      }

      return constraints;
    },
  },
});
