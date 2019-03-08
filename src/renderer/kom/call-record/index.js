
import rtc from '../../rtc';

export default {
  data() {

  },
  computed : {
    callStatus() {
      return rtc.call.ringing;
    },
  },
  watch : {

  },
};
