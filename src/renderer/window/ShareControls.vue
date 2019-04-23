<template>
  <div id="window" ref="controls" class="share-controls">
    <div class="flex controls-wrapper w-full h-full justify-between items-center px-4 select-none">
      <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                  title="信号"
                  class="text-white text-base cursor-pointer"
                  @click="showStatisticsModal"/>
      <span>ID: {{targetId}}</span>
      <span class="mr-2">共享时长: {{duration}}</span>
      <a-button class="ml-2 bg-transparent border-white text-white"
                @click="showSharingModal">
        <a-iconfont type="icon-qiehuan"></a-iconfont>
        切换共享
      </a-button>
      <a-button @click="terminateSharing"
                class="bg-red-light border-transparent text-white">
        <a-iconfont type="icon-tingzhi" class="text-white"></a-iconfont>
        停止共享
      </a-button>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron';
import { debounce } from 'lodash';
import { secondsToHms } from '../utils';

export default {
  name : 'ShareControls',
  data() {
    return {
      // 统计相关
      duration      : '00:00:00',
      signal        : 4,
      // 定时器
      durationTimer : null,
      shrinkTimer   : null,
      // 拖动相关
      isDragging    : false,
      mouseX        : null,
      mouseY        : null,
      mouseEnter    : false,
    };
  },
  computed : {
    rtc() {
      return (window.opener && window.opener.rtc) || window.rtc;
    },
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },
    origin() {
      return {
        fromConference : this.rtc.conference.connected,
        fromCall       : this.rtc.call.connected,
      };
    },
    targetId() {
      return this.origin.fromConference
        ? this.rtc.conference.information.description.conferenceId
        : this.rtc.call.remoteIdentity.uri.user;
    },
  },
  created() {
    this.initSignal();
    this.lazyShrink = debounce(this.shrinkToTop, 200);
    this.lazyExpand = debounce(this.expandFromTop, 200);

    remote.getCurrentWindow().on('move', this.lazyShrink);
  },
  async mounted() {
    this.EVENT_MAP = {
      mouseup    : this.onControlsClickUp,
      mousedown  : this.onControlsClickDown,
      mousemove  : this.onControlsDrag,
      mouseenter : this.onMouseEnter,
      mouseleave : this.onMouseLeave,
    };
    await this.$nextTick();
    this.setupEvent(this.$refs.controls);
  },
  beforeDestroy() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    if (this.shrinkTimer) clearInterval(this.shrinkTimer);
    this.removeEvent(this.$refs.controls);
  },
  methods : {
    // 事件相关
    onControlsClickDown({ pageX, pageY }) { // 鼠标点下
      this.mouseX = pageX;
      this.mouseY = pageY;
      this.isDragging = true;
    },
    onControlsClickUp() { // 鼠标松开
      this.isDragging = false;
    },
    onControlsDrag({ pageX, pageY }) { // 鼠标点击拖动
      if (this.isDragging) {
        const win = remote.getCurrentWindow();

        let [ x, y ] = win.getPosition();

        x += (pageX - this.mouseX);
        y += (pageY - this.mouseY);
        win.setPosition(x, y, true);
      }
    },
    onMouseEnter() { // 鼠标移进来
      this.mouseEnter = true;
      this.lazyExpand();
    },
    onMouseLeave({ pageY }) { // 鼠标移出去
      if (pageY < 6 && pageY > 0) return;
      this.mouseEnter = false;
      this.isDragging = false;
      this.lazyShrink();
    },
    setupEvent(target, eventMap = this.EVENT_MAP) {
      Object.entries(eventMap).forEach(([ event, handle ]) => target.addEventListener(event, handle));
    },
    removeEvent(target, eventMap = this.EVENT_MAP) {
      Object.entries(eventMap).forEach(([ event, handle ]) => target.removeEventListener(event, handle));
    },

    // 窗口隐藏相关
    shrinkToTop() {
      if (this.shrinkTimer) clearInterval(this.shrinkTimer);
      this.shrinkTimer = setTimeout(() => {
        if (this.mouseEnter) return;
        const current = remote.getCurrentWindow();
        const [ offsetX, offsetY ] = current.getPosition();

        if (offsetY > -50 && offsetY < 10) {
          current.setPosition(offsetX, -50);
        }
      }, this.shrinkTimer ? 1000 : 5000);
    },
    expandFromTop() {
      const current = remote.getCurrentWindow();
      const [ offsetX, offsetY ] = current.getPosition();

      if (offsetY < 0) {
        current.setPosition(offsetX, 0);
      }
    },

    // 展示modal
    async toMain() {
      const { fromConference, fromCall } = this.origin;

      if (!fromConference && !fromCall) return this.terminateSharing();
      await this.kom.dispatch('application.show');
      const prop = fromConference ? 'isInMiniConference' : 'isInMiniCall';

      this.kom.vm.state[prop] = false;
    },
    async showStatisticsModal() {
      this.toMain();
      Promise.resolve().then(() => {
        this.kom.vm.conference.sketch.isSharingVisible = false;
        this.kom.vm.conference.sketch.isStatisticsVisible = true;
      });
    },
    async showSharingModal() {
      this.toMain();
      Promise.resolve().then(() => {
        this.kom.vm.conference.sketch.isStatisticsVisible = false;
        this.kom.vm.conference.sketch.isSharingVisible = true;
      });
    },

    // 一些操作
    async terminateSharing() { // 终止分享辅流
      const { fromConference } = this.origin;

      const channel = fromConference
        ? this.rtc.conference.shareChannel
        : this.rtc.call.share;

      await channel.disconnect();
      window.close();
    },
    initSignal() {
      let checkInterval = 1; // 1 2 4 8 循环时长

      let checkTimes = 0;

      // 设置会议进行时间
      const meetTime = new Date();

      this.durationTimer = setInterval(() => {
        const time = (new Date().getTime() - meetTime.getTime()) / 1000;

        if (checkTimes > checkInterval) checkTimes = 0;
        while (checkTimes++ === checkInterval) {
          let target;

          let closeWindow = false;

          const { fromConference, fromCall } = this.origin;

          if (fromConference) {
            target = this.rtc.conference;
            closeWindow = !target || !target.shareChannel.localStream;
          }
          else if (fromCall) {
            target = this.rtc.call.share.channel;
            closeWindow = !target || !target.localStream;
          }
          else {
            this.terminateSharing();
          }
          if (closeWindow) {
            this.terminateSharing();
          }

          target.getStats().then((val) => {
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
    cursor: move;
    .controls-wrapper {
      font-size: 14px;
      color: #FFFFFF;
      line-height: 22px;
    }
  }
</style>
