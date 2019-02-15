import net from 'net';
import rtc from '../../rtc';

export default {
  date() {
    return {

    };
  },
  methods : {
    doAudioCall(info) {
      // 判断是否为IP 直播 10.86.5.3 or 10*86*5*3
      const number = info.payload.replace(/\*/g, '.');

      if (net.isIP(number)) {
        rtc.ipcall.connect(number).then(() => {}).catch(() => {});

        return;
      }
      const { call } = rtc;

      call.target = info.payload;

      return call.connect();
    },
  },
};
