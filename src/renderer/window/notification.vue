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
            <div class="text-base leading-none mt-4 truncate">{{conference['start-time']}}}</div>
          </div>
        </div>
      </div>

      <div class="flex justify-center mt-4 self-end">
        <!--麦克风（接听）-->
        <a-button class="text-base w-36">
          <a-iconfont type="icon-qiehuan"/>
          转语音通话
        </a-button>
        <!--麦克风（接听）-->
        <a-button class="text-base w-14 ml-3 text-white border-transparent"
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
export default {
  name : 'notification',
  data() {
    return {
      scheduleEvents : [],
    };
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
    const state = this.kom.vm.$getVM('state');

    this.scheduleEvents = state.scheduleEvents;

    setTimeout(() => {
      window.close();
      state.$emit('notify-close');
    }, 6000);
  },
  methods : {
    close() {
      const state = this.kom.vm.$getVM('state');

      state.scheduleEvents.shift();
      window.close();
      state.$emit('notify-close');
    },
  },
};
</script>

<style lang="less">
</style>
