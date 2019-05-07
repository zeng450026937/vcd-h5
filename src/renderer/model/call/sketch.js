import Vuem from '../vuem';
import rtc from '../../rtc';
import { $t } from '../../i18n';

const sketch = new Vuem();

const initialDate = () => ({
  // 一些可见性的Modal
  isStatisticsVisible : false,
  isSharingVisible    : false,

  currentTab       : '', // TabSetting TabChatting
  isInCallMain     : true,
  hideControls     : false,
  showMorePanel    : false,
  localWindowState : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand
  shareWindowState : { current: 1, pre: 1 }, // 0.min 1.shrink 2.mini 3.normal 4.expand

  isShareInCenter       : false,
  isShareWindowOpen     : false,
  // Device Exception
  deviceExceptionNotice : {
    instance : null,
    close() {
      if (typeof this.instance === 'function') {
        this.instance();
        this.instance = null;
      }
    },
    open(ctx, videoException, audioException) {
      if (typeof this.instance === 'function') return;
      const h = ctx.$createElement;

      const text = videoException
        ? $t('conversation.exception.video')
        : audioException ? $t('conversation.exception.audio')
          : $t('conversation.exception.both');

      const content = h('div', { class: 'inline-block no-dragable' }, [
        h('div', { class: 'inline-block' }, text),
        h('a-iconfont', {
          class : 'ml-3 mr-0 cursor-pointer text-black9 hover:text-red-light',
          props : { type: 'icon-guanbi' },
          on    : {
            click : () => { this.close(); },
          } }),
      ]);

      this.instance = ctx.$message.warning(content, 0);
    },
  },
});

sketch.provide({
  data() {
    return initialDate();
  },
  computed : {
    hasException() {
      return this.videoException || this.audioException;
    },
    callStatus() {
      return rtc.call.status;
    },
  },
  watch : {
    callStatus(val, oldVal) {
      if (val === 'disconnected'
        || val === 'finished'
        || val === 'failed') { // 退出会议之后重置当前状态
        this.deviceExceptionNotice.close();
        Object.assign(this, initialDate());
      }
    },
    isInCallMain(val) {
      if (val) {
        this.localWindowState.current = this.localWindowState.pre;
      }
      else {
        this.localWindowState.pre = this.localWindowState.current;
        this.localWindowState.current = 2;
      }
    },
  },
});

export default sketch;
