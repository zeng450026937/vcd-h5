import Device from './Device';
import AudioQuality from '../Quality/AudioQuality';

export default Device.extend({
  mixins : [ Device ],
  data() {
    return {
      quality : new AudioQuality(),
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
