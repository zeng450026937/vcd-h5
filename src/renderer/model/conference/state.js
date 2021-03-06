/* eslint-disable no-loop-func */
import Vuem from '../vuem';
import { secondsToHms } from '../../utils';
import rtc from '../../rtc';
import { $t } from '../../i18n';

const state = new Vuem();

state.provide({
  data() {
    return {
      duration      : '00:00:00',
      interval      : 0,
      callInterval  : 0, // 音频转视频情况
      signal        : 4,
      durationTimer : null,
      warningNotice : null,
    };
  },
  computed : {
    isConnected : () => rtc.conference.connected,
  },
  methods : {
    initSignal() {
      let checkInterval = 1; // 1 2 4 8 循环时长

      let checkTimes = 0;

      let isShowSignalWarning = false;
      // 设置会议进行时间
      const meetTime = new Date();

      this.durationTimer = setInterval(() => {
        this.interval = this.callInterval + (new Date().getTime() - meetTime.getTime()) / 1000;

        if (checkTimes > checkInterval) checkTimes = 0;
        while (checkTimes++ === checkInterval) {
          rtc.conference.getStats().then((val) => {
            if (this.signal === val.media.quality) {
              checkInterval *= 2;
              checkInterval = (checkInterval * 2) % 15;
              checkTimes = 0;
            }
            const { quality } = val.media;

            if (quality <= 0) { // 丢包率 > 12% (10%)
              if (!isShowSignalWarning) {
                const noticeTimeout = setTimeout(() => {
                  clearTimeout(noticeTimeout);
                  if (this.isConnected) {
                    isShowSignalWarning = true;
                    this.warningNotice = this.$message.warning($t('conversation.tip.unstableNetwork'), 0);
                  }
                }, 500);
              }
            }
            else {
              if (isShowSignalWarning) {
                if (typeof this.warningNotice === 'function') {
                  this.warningNotice();
                  this.warningNotice = null;
                }
              }
              isShowSignalWarning = false;
            }

            this.signal = quality >= 1 ? quality : '1';
          });
        }
        this.duration = secondsToHms(this.interval);
      }, 1000);
    },
  },
  watch : {
    isConnected(val) {
      if (val) {
        this.initSignal();
        const { _isRefer } = rtc.conference.mediaChannel.channel;

        this.callInterval = rtc.call.connected || _isRefer
          ? this.$getVM('call.state').interval : 0;
      }
      else if (this.durationTimer) {
        clearInterval(this.durationTimer);
        this.duration = '00:00:00';
        this.signal = 4;
        this.interval = 0;
        if (typeof this.warningNotice === 'function') {
          this.warningNotice();
          this.warningNotice = null;
        }
      }
    },
  },
});

export default state;
