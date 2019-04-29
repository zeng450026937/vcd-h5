<template>
  <a-layout id="window" class="h-full bg-white">
    <div class="flex flex-col p-5 h-full">
      <div class="flex flex-grow mt-5">
        <div class="flex h-12">
          <div>
            <a-avatar :size="48" class="target-avatar">
              <a-iconfont class="text-2xl" type="icon-huiyishi"></a-iconfont>
            </a-avatar>
          </div>

          <div class="flex flex-col ml-5 truncate" style="width: 220px">
            <div class="text-base leading-none font-bold truncate" :title="conference.subject">
              {{conference.subject}}
            </div>
            <div class="text-base leading-none mt-4 truncate">{{conference['start-time'] | tipMsg}}</div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end">
        <!--麦克风（接听）-->
        <a-button @click="audioEnter" class="text-base w-36">
          <a-iconfont type="icon-qiehuan"/>
          转语音通话
        </a-button>
        <!--麦克风（接听）-->
        <a-button @click="enterMeeting" class="text-base w-14 ml-3 text-white border-transparent"
                  type="primary">
          <a-iconfont type="icon-yuyin"/>
        </a-button>
        <a-button @click="close" class="text-base w-14 text-white ml-3 bg-red-light border-transparent">
          <a-iconfont type="icon-guaduan"/>
        </a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { remote } from 'electron';

export default {
  name : 'notification',
  data() {
    return {
      scheduleEvents : [],
    };
  },
  filters : {
    tipMsg(startTime) {
      if (!startTime) return '';

      const now = Date.now();
      const start = startTime.valueOf();

      if (start - now > 1000 * 60 * 4) return '会议5分钟后开始';

      if (start - now < 1000 * 60 * 4 && start - now > 0) return '会议即将开始';

      if (start - now < 0) return '会议进行中';
    },
  },
  computed : {
    kom() {
      return (window.opener && window.opener.kom) || window.kom;
    },
    conference() {
      return this.scheduleEvents[0] || {};
    },
  },
  mounted() {
    const notify = this.kom.vm.$getVM('notify');

    this.scheduleEvents = notify.scheduleEvents;

    window.updatePosition = this.updatePosition;

    setTimeout(() => {
      this.close();
    }, 10000);
  },
  beforeDestroy() {
    this.updatePosition = null;
  },
  methods : {
    close() {
      const notify = this.kom.vm.$getVM('notify');

      window.close();
      notify.$emit('notify-close', window.id);
    },
    enterMeeting() {
      const params = {
        number       : this.conference['conference-number'],
        pin          : this.conference['presenter-pin'],
        initialVideo : true,
        initialAudio : true,
      };

      this.kom.dispatch('meeting.joinMeeting', params);
      this.close();
    },
    audioEnter() {
      const params = {
        number       : this.conference['conference-number'],
        pin          : this.conference['presenter-pin'],
        initialVideo : false,
        initialAudio : true,
      };

      this.kom.dispatch('meeting.joinMeeting', params).then(() => {
        this.kom.vm.conference.sketch.isVideoConference = false;
      });
      this.close();
    },
    updatePosition(y) {
      const browserWindow = remote.getCurrentWindow();
      const [ currentX ] = browserWindow.getPosition();

      setTimeout(() => {
        browserWindow.setPosition(currentX, y, true);
      }, 500);
    },
  },
};
</script>

<style lang="less">
</style>
