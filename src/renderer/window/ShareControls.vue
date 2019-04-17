<template>
  <div id="window" class="share-controls">
    <div class="flex controls-wrapper w-full h-full justify-between items-center px-4">
      <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                  title="信号"
                  class="text-white text-base cursor-pointer"/>
      <span>ID: 6666555588</span>
      <span class="mr-2">共享时长: {{duration}}</span>
      <a-button class="ml-2 bg-transparent border-white text-white">
        <a-iconfont type="icon-qiehuan"></a-iconfont>
        切换共享
      </a-button>
      <a-button @click="closeSharing" class="bg-red-light border-transparent text-white">
        <a-iconfont type="icon-tingzhi" class="text-white"></a-iconfont>
        停止共享
      </a-button>
    </div>
  </div>
</template>

<script>
import { secondsToHms } from '../utils';

export default {
  name : 'ShareControls',
  data() {
    return {
      duration      : '00:00:00',
      signal        : 4,
      durationTimer : null,
    };
  },
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },
  },
  created() {
    this.initSignal();
  },
  beforeDestroy() {
    if (this.durationTimer) clearInterval(this.durationTimer);
  },
  methods : {
    async closeSharing() {
      if (this.rtc.conference.connected) {
        await this.rtc.conference.shareChannel.disconnect();
      }
      else if (this.rtc.call.connected) {
        await this.rtc.call.share.channel.disconnect();
      }
      window.close();
    },
    initSignal() {
      let checkInterval = 1; // 1 2 4 8 循环时长

      let checkTimes = 0;

      // 设置会议进行时间
      const meetTime = new Date();

      this.durationTimer = setInterval(() => {
        const time = (new Date().getTime() - meetTime.getTime()) / 1000;

        while (checkTimes++ === checkInterval) {
          this.rtc.conference.getStats().then((val) => {
            if (this.signal === val.media.quality) {
              checkInterval *= 2;
              checkInterval = (checkInterval * 2) % 15;
              checkTimes = 0;
            }
            const { quality } = val.media;

            this.signal = quality >= 1 ? quality : '1';
          });
        }
        this.duration = secondsToHms(time);
      }, 1000);
    },
  },
};
</script>

<style lang="less">
#window {
  width: 614px;
  height: 56px;
  background: rgba(0,0,0,0.65);
  border-radius: 0 0 4px 4px;
  .controls-wrapper {
    font-size: 14px;
    color: #FFFFFF;
    line-height: 22px;
  }
}
</style>
