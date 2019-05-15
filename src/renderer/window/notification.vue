<template>
  <a-layout id="window" class="h-full bg-white">
    <div class="flex flex-col h-full wrapper">
      <div class="header">
        <a-iconfont type="icon-guanbi" class="close hover:bg-red-light hover:text-white header-control"
                    :title="$t('common.controls.close')"
                    @click="close"></a-iconfont>
      </div>
      <div class="flex flex-grow mt-5 content">
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
            <div class="leading-none mt-4 truncate flex justify-between" >
              <span class="text-xs">
                {{conference['conference-number']}}
              </span>
              <span style="color: #4A5FC4" class="mr-3 text-xs"> {{conference['start-time'] | tipMsg}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end mb-4 mr-4">
        <a-button @click="enterMeeting" class="text-base w-14 ml-3 text-white border-transparent"
                  type="primary">
          <a-iconfont type="icon-shipin"/>
        </a-button>
        <a-button @click="audioEnter" class="text-base w-14 ml-3 text-white border-transparent"
                  type="primary">
          <a-iconfont type="icon-yuyin"/>
        </a-button>
        <a-button @click="toDetail" class="text-base ml-3">
          {{$t('home.details')}}
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

    this.scheduleEvents = this.clone(notify.scheduleEvents);

    window.updatePosition = this.updatePosition;

    setTimeout(() => {
      this.close();
    }, 10000);
  },
  beforeDestroy() {
    this.updatePosition = null;
  },
  methods : {
    clone(data) {
      return JSON.parse(JSON.stringify(data));
    },
    close() {
      const notify = this.kom.vm.$getVM('notify');

      notify.$emit('notify-close', window.id);
      window.close();
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
    toDetail() {
      const notify = this.kom.vm.$getVM('notify');

      this.close();
      notify.$emit('to-detail', { conference: this.conference });
    },
  },
};
</script>

<style lang="less">
  #window {
    .wrapper {
      .content{
        padding: 0 20px 20px 20px ;
      }

      .header {
        height: 35px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        .header-control {
          color: #666666;
          &:hover {
            background: #e5e5e5;
            color: #000000;
          }
          transition: all .2s ease-in-out;
        @apply text-base w-12 cursor-pointer flex items-center justify-center;
        }
      }
    }
  }
</style>
