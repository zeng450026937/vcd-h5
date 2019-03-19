import Vuem from '../vuem';
import rtc from '../../rtc';
import { secondsToHms } from '../../utils';

const state = new Vuem();

state.provide({
  data() {
    return {
      duration      : '00:00:00',
      signal        : 4,
      durationTimer : null,
    };
  },
  computed : {
    isConnected : () => rtc.call.connected,
  },
  methods : {
    initSignal() {
      let checkInterval = 1; // 1 2 4 8 循环时长

      let checkTimes = 0;
      // 设置会议进行时间
      const meetTime = new Date();

      this.durationTimer = setInterval(() => {
        const time = (new Date().getTime() - meetTime.getTime()) / 1000;

        while (checkTimes++ === checkInterval) {
          rtc.call.getStats().then((val) => {
            if (this.signal === val.quality) {
              checkInterval *= 2;
              checkInterval = (checkInterval * 2) % 15;
              checkTimes = 0;
            }
            this.signal = val.quality || '1';
          });
        }
        this.duration = secondsToHms(time);
      }, 1000);
    },
  },
  watch : {
    isConnected(val) {
      if (val) {
        this.initSignal();
      }
      else if (this.durationTimer) {
        clearInterval(this.durationTimer);
        this.duration = '00:00:00';
        this.signal = 4;
      }
    },
  },
});

export default state;
