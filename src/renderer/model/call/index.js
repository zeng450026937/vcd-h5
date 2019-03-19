import net from 'net';
import Vuem from '../vuem';
import rtc from '../../rtc';
import chat from './chat';
import state from './state';

const model = new Vuem();

model.mount('chat', chat);
model.mount('state', state);

model.provide({
  data() {
    return {

    };
  },
  methods : {
    doAudioCall(info) {
      // 判断是否为IP 直播 10.81.45.13 or 10*86*5*3
      const number = info.payload.replace(/\*/g, '.');

      if (net.isIP(number)) {
        return rtc.ipcall.connect(number);
      }
      const { call } = rtc;

      call.target = info.payload;

      return call.connect();
    },
  },
});

export default model;
