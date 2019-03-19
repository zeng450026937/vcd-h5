import Vuem from '../vuem';
import rtc from '../../rtc';

const sketch = new Vuem();

const initialDate = () => ({
  isInCallMain : true, // 是否隐藏会议页面底部和头部的控制按钮
  currentTab   : '',
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
