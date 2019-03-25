import net from 'net';
import Vuem from '../vuem';
import rtc from '../../rtc';
import chat from './chat';
import state from './state';
import sketch from './sketch';

const model = new Vuem();

model.mount('chat', chat);
model.mount('state', state);
model.mount('sketch', sketch);

model.provide({
  data() {
    return {
      isVideoCall : false,
    };
  },
  middleware : {
    call(ctx) {
      let { number } = ctx.payload;
      // 判断是否为IP 直播 10.81.45.13 or 10*86*5*3

      number = number.replace(/\*/g, '.');

      if (net.isIP(number)) {
        return rtc.ipcall.connect(number);
      }
      const { call } = rtc;

      call.target = number;

      this.isVideoCall = ctx.payload.options.video;

      return call.connect('send', ctx.payload.options);
    },
    answer() {
      rtc.call.answer().catch(() => {});
    },
    decline() {
      rtc.call.decline().catch(() => {});
    },
  },
});

export default model;
