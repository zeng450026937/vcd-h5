import Vuem from '../vuem';
import rtc from '../../rtc';

const sketch = new Vuem();

const initialDate = () => ({
  currentTab       : '',
  isInCallMain     : true,
  hideControls     : false,
  showMorePanel    : false,
  localWindowState : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  shareWindowState : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand

  isShareInCenter   : false,
  isShareWindowOpen : false,
});

sketch.provide({
  data() {
    return initialDate();
  },
  computed : {
    callStatus() {
      return rtc.call.status;
    },
  },
  watch : {
    callStatus(val, oldVal) {
      if (val === 'disconnected') { // 退出会议之后重置当前状态
        Object.assign(this, initialDate());
      }
    },
  },
});

export default sketch;
